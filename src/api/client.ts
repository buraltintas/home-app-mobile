import * as SecureStore from 'expo-secure-store';
import type { Locale, SearchHistoryEntry, Store, LocationResult, Post, PrivateProfile, SearchResponse, StoreDetail, TokenPair, VisitVerification } from './types';

const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN ?? 'http://localhost:8080';
// Temporary backend contract: this static mobile client credential is extractable.
// Keep it isolated here so attestation or a gateway exchange can replace it.
const MOBILE_CLIENT_KEY = process.env.EXPO_PUBLIC_MOBILE_BFF_SECRET ?? '';
const ACCESS_KEY = 'bosagezme.access';
const REFRESH_KEY = 'bosagezme.refresh';
const VISITOR_KEY = 'bosagezme.visitor';
const VISIT_PROOF_PREFIX = 'bosagezme.visit-proof.';
let refreshPromise: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) { onSessionExpired = handler; }

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
    if (!response.ok) { await clearSession(); onSessionExpired?.(); return null; }
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
export function mobileMediaSource(path:string) { return {uri:new URL(path,API_ORIGIN).toString(),headers:{'X-BFF-Secret':MOBILE_CLIENT_KEY}}; }
// Provider photographs are streamed through the API and never cached by us, because keeping
// the bytes would breach the provider terms. The client key travels as a header because the
// endpoint is behind the same client check as everything else.
export function mobilePlacePhotoSource(name:string,width=520) {
  return {uri:`${API_ORIGIN}/v1/places/photo?name=${encodeURIComponent(name)}&w=${width}`,headers:{'X-BFF-Secret':MOBILE_CLIENT_KEY}};
}
export const mobileApi = {
  feed: (locale: Locale, location?:{latitude:number;longitude:number}, cursor?:string) => {
    const params=new URLSearchParams({limit:'20'}); if(location){params.set('latitude',String(location.latitude));params.set('longitude',String(location.longitude));}if(cursor)params.set('cursor',cursor);
    return apiFetch<{items:Post[];next_cursor:string}>(`/v1/feed?${params}`,{},locale);
  },
  search: (query:string, locale:Locale, location?:{latitude:number;longitude:number}) => apiFetch<SearchResponse>('/v1/search',{method:'POST',body:JSON.stringify({query,...location})},locale),
  searchLocations: (query:string,locale:Locale) => apiFetch<{items:LocationResult[]}>(`/v1/locations/search?q=${encodeURIComponent(query)}&limit=5`,{},locale),
  // A prediction carries no coordinates, and a point we search around should be fetched
  // from the provider rather than taken from the device. So the chosen place is resolved.
  resolveLocation: (placeId:string,locale:Locale) => apiFetch<LocationResult>(`/v1/locations/resolve?place_id=${encodeURIComponent(placeId)}`,{},locale),
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
  store: (id:string, locale:Locale, location?:{latitude:number;longitude:number}) => {
    const params=new URLSearchParams();
    if(location){params.set('latitude',String(location.latitude));params.set('longitude',String(location.longitude));}
    const query=params.toString();
    return apiFetch<StoreDetail>(`/v1/stores/${id}${query?`?${query}`:''}`,{},locale);
  },
  // A private message to us about the product. No account required, for the same reason
  // browsing does not need one: somebody who cannot use the app is exactly who needs to be
  // able to say so.
  // Photographs go straight to object storage through a signed URL; the API never carries
  // the bytes. Three steps: ask for a slot, PUT the file to the URL it names, then tell the
  // API the object is there. A review references the id, not the URL.
  createUpload: (mimeType:string, sizeBytes:number, locale:Locale) =>
    apiFetch<{id:string;upload:{upload_url:string;headers:Record<string,string>}}>(
      '/v1/media/uploads',{method:'POST',body:JSON.stringify({mime_type:mimeType,size_bytes:sizeBytes})},locale),
  completeUpload: (id:string, locale:Locale) => apiFetch<void>(`/v1/media/${id}/complete`,{method:'POST'},locale),
  sendFeedback: (input:{kind:string;message:string;contact_email?:string}, locale:Locale) =>
    apiFetch<void>('/v1/feedback',{method:'POST',body:JSON.stringify(input)},locale),
  me: (locale:Locale) => apiFetch<PrivateProfile>('/v1/me',{},locale),
  updateMe: (patch:Record<string,unknown>, locale:Locale) => apiFetch<PrivateProfile>('/v1/me',{method:'PATCH',body:JSON.stringify(patch)},locale),
  searches: (locale:Locale) => apiFetch<{items:SearchHistoryEntry[]}>('/v1/me/searches?limit=20',{},locale),
  deleteSearch: (id:string, locale:Locale) => apiFetch<void>(`/v1/me/searches/${id}`,{method:'DELETE'},locale),
  clearSearches: (locale:Locale) => apiFetch<void>('/v1/me/searches',{method:'DELETE'},locale),
  // Signing out revokes the token family on the server as well as clearing this device.
  // Dropping the tokens locally would leave a refresh token valid for its whole lifetime.
  logout: async (locale:Locale) => { try{ await apiFetch<void>('/v1/auth/logout',{method:'POST'},locale); } finally { await clearSession(); } },
  favorites: (locale:Locale) => apiFetch<{items:Store[]}>('/v1/me/favorites?limit=50',{},locale),
  // Finding the store you are standing in. Name search answers "the place I can see the
  // sign of"; nearby answers "the place I am inside", which is the common case when
  // somebody opens this to write a review.
  storeSearch: (query:string, locale:Locale) => apiFetch<{items:Store[]}>(`/v1/stores/search?q=${encodeURIComponent(query)}&limit=15`,{},locale),
  storesNearby: (location:{latitude:number;longitude:number}, locale:Locale) => {
    const params=new URLSearchParams({latitude:String(location.latitude),longitude:String(location.longitude),radius:'2000',limit:'15'});
    return apiFetch<{items:Store[]}>(`/v1/stores/nearby?${params}`,{},locale);
  },
  // Which result was opened, so the search that produced it can be measured. Without this
  // the conversion funnel counts every mobile search as one that led nowhere.
  // The field names have to be the API's own. They were not, and neither was the event
  // name, so every interaction the app reported was rejected and the conversion funnel
  // counted every mobile search as one that led nowhere -- which is exactly what the
  // comment above claimed this prevented.
  recordInteraction: (searchId:string, resultId:string, kind:string, locale:Locale) =>
    apiFetch<void>(`/v1/searches/${searchId}/interactions`,{method:'POST',body:JSON.stringify({search_result_id:resultId,event_type:kind,idempotency_key:`${kind}:${resultId}`})},locale),
  // What people around here have actually searched for. Empty in a quiet neighbourhood,
  // and the caller falls back to the seasonal list rather than showing nothing.
  searchSuggestions: (location:{latitude:number;longitude:number}, locale:Locale) =>
    apiFetch<{items:{query:string;search_count:number}[]}>(`/v1/search/suggestions?latitude=${location.latitude}&longitude=${location.longitude}`,{},locale),
  categories: (locale:Locale) => apiFetch<{items:{slug:string;name:string;search_count:number}[]}>('/v1/categories',{},locale),
  requestCode: (email:string, locale:Locale) => apiFetch<{status:string}>('/v1/auth/email/request-code',{method:'POST',body:JSON.stringify({email})},locale),
  verifyCode: (email:string,code:string,locale:Locale) => apiFetch<TokenPair>('/v1/auth/email/verify-code',{method:'POST',body:JSON.stringify({email,code})},locale),
  favorite: (id:string,locale:Locale,saved:boolean) => apiFetch<void>(`/v1/stores/${id}/favorite`,{method:saved?'DELETE':'POST'},locale,true),
  like: (id:string,locale:Locale,liked:boolean) => apiFetch<void>(`/v1/posts/${id}/like`,{method:liked?'DELETE':'POST'},locale,true),
  deleteAccount: async (locale:Locale) => {await apiFetch<void>('/v1/me',{method:'DELETE'},locale,true);await clearSession();},
};
