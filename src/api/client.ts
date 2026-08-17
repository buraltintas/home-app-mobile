import * as SecureStore from 'expo-secure-store';
import type { Locale, LocationResult, Post, PrivateProfile, SearchResponse, StoreDetail, TokenPair, VisitVerification } from './types';

const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN ?? 'http://localhost:8080';
// Temporary backend contract: this static mobile client credential is extractable.
// Keep it isolated here so attestation or a gateway exchange can replace it.
const MOBILE_CLIENT_KEY = process.env.EXPO_PUBLIC_MOBILE_BFF_SECRET ?? '';
const ACCESS_KEY = 'bosagezme.access';
const REFRESH_KEY = 'bosagezme.refresh';
const VISITOR_KEY = 'bosagezme.visitor';
const VISIT_PROOF_PREFIX = 'bosagezme.visit-proof.';
let refreshPromise: Promise<string | null> | null = null;

async function headers(locale: Locale, authenticated = false) {
  const result: Record<string, string> = {'Content-Type':'application/json','X-BFF-Secret':MOBILE_CLIENT_KEY,'X-Locale':locale,'X-Client-Type':'mobile','X-Client-Version':'1.0.0'};
  const visitor = await SecureStore.getItemAsync(VISITOR_KEY);
  if (visitor) result['X-Visitor-Session-ID'] = visitor;
  if (authenticated) { const access = await SecureStore.getItemAsync(ACCESS_KEY); if (access) result.Authorization = `Bearer ${access}`; }
  return result;
}

async function rotate(locale: Locale) {
  if (!refreshPromise) refreshPromise = (async () => {
    const refresh = await SecureStore.getItemAsync(REFRESH_KEY); if (!refresh) return null;
    const response = await fetch(`${API_ORIGIN}/v1/auth/refresh`, {method:'POST',headers:await headers(locale),body:JSON.stringify({refresh_token:refresh})});
    if (!response.ok) { await clearSession(); return null; }
    const pair = await response.json() as TokenPair; await saveSession(pair); return pair.access_token;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, locale: Locale = 'tr', authenticated = false): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, {...init,headers:{...(await headers(locale,authenticated)),...(init.headers ?? {})}});
  if (response.status === 401 && authenticated) {
    const token = await rotate(locale); if (token) return apiFetch<T>(path,init,locale,true);
  }
  if (!response.ok) throw await response.json();
  if (response.status === 204) return undefined as T;
  const data = await response.json() as T;
  if (typeof data === 'object' && data && 'visitor_session_id' in data && typeof (data as {visitor_session_id?:unknown}).visitor_session_id === 'string') await SecureStore.setItemAsync(VISITOR_KEY,(data as {visitor_session_id:string}).visitor_session_id);
  return data;
}

export async function saveSession(pair: TokenPair) { await Promise.all([SecureStore.setItemAsync(ACCESS_KEY,pair.access_token),SecureStore.setItemAsync(REFRESH_KEY,pair.refresh_token)]); }
export async function clearSession() { await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY),SecureStore.deleteItemAsync(REFRESH_KEY)]); }
export async function hasSession() { return Boolean(await SecureStore.getItemAsync(ACCESS_KEY)); }
export const mobileApi = {
  feed: (locale: Locale, location?:{latitude:number;longitude:number}, cursor?:string) => {
    const params=new URLSearchParams({limit:'20'}); if(location){params.set('latitude',String(location.latitude));params.set('longitude',String(location.longitude));}if(cursor)params.set('cursor',cursor);
    return apiFetch<{items:Post[];next_cursor:string}>(`/v1/feed?${params}`,{},locale);
  },
  search: (query:string, locale:Locale, location?:{latitude:number;longitude:number}) => apiFetch<SearchResponse>('/v1/search',{method:'POST',body:JSON.stringify({query,...location})},locale),
  searchLocations: (query:string,locale:Locale) => apiFetch<{items:LocationResult[]}>(`/v1/locations/search?q=${encodeURIComponent(query)}&limit=5`,{},locale),
  saveManualLocation: (placeId:string,locale:Locale) => apiFetch<PrivateProfile>('/v1/me/discovery-location',{method:'PUT',body:JSON.stringify({source:'manual',place_id:placeId})},locale,true),
  saveDeviceLocation: (location:{latitude:number;longitude:number;accuracy_meters:number},locale:Locale) => apiFetch<PrivateProfile>('/v1/me/discovery-location',{method:'PUT',body:JSON.stringify({source:'device',...location})},locale,true),
  clearDiscoveryLocation: (locale:Locale) => apiFetch<void>('/v1/me/discovery-location',{method:'DELETE'},locale,true),
  verifyVisit: async (storeId:string,location:{latitude:number;longitude:number;accuracy_meters:number},locale:Locale) => {
    const proof=await apiFetch<VisitVerification>(`/v1/stores/${storeId}/visit-verifications`,{method:'POST',body:JSON.stringify(location)},locale,true);
    await SecureStore.setItemAsync(`${VISIT_PROOF_PREFIX}${storeId}`,JSON.stringify(proof)); return proof;
  },
  visitProof: async (storeId:string) => {const value=await SecureStore.getItemAsync(`${VISIT_PROOF_PREFIX}${storeId}`);return value?JSON.parse(value) as VisitVerification:null;},
  clearVisitProof: (storeId:string) => SecureStore.deleteItemAsync(`${VISIT_PROOF_PREFIX}${storeId}`),
  createReview: (payload:{store_id:string;text:string;rating:number;media_ids?:string[];content_language?:Locale;origin_search_id?:string;origin_search_result_id?:string} & ({latitude:number;longitude:number;accuracy_meters:number;visit_verification_id?:never}|{visit_verification_id:string;latitude?:never;longitude?:never;accuracy_meters?:never}),locale:Locale) => apiFetch<Post>('/v1/posts',{method:'POST',body:JSON.stringify(payload)},locale,true),
  store: (id:string, locale:Locale) => apiFetch<StoreDetail>(`/v1/stores/${id}`,{},locale),
  requestCode: (email:string, locale:Locale) => apiFetch<{status:string}>('/v1/auth/email/request-code',{method:'POST',body:JSON.stringify({email})},locale),
  verifyCode: (email:string,code:string,locale:Locale) => apiFetch<TokenPair>('/v1/auth/email/verify-code',{method:'POST',body:JSON.stringify({email,code})},locale),
  favorite: (id:string,locale:Locale,saved:boolean) => apiFetch<void>(`/v1/stores/${id}/favorite`,{method:saved?'DELETE':'POST'},locale,true),
  deleteAccount: async (locale:Locale) => {await apiFetch<void>('/v1/me',{method:'DELETE'},locale,true);await clearSession();},
};
