import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/Primitives';
import { StoreRow } from '../components/StoreRow';
import { useI18n, localeNames } from '../i18n';
import { colors, fonts, radius, spacing } from '../theme/tokens';
import type { Locale, Store } from '../api/types';
import { mobileApi } from '../api/client';

export function FavoritesScreen({onAuth,onStore}:{onAuth:()=>void;onStore:(storeId:string)=>void}) {
  const {t,locale}=useI18n();
  const [stores,setStores]=useState<Store[]|null>(null);
  const [state,setState]=useState<'loading'|'ready'|'signedOut'|'error'>('loading');

  const load=useCallback(async()=>{
    setState('loading');
    try{const result=await mobileApi.favorites(locale);setStores(result.items??[]);setState('ready');}
    catch(reason){
      const code=(reason as {error?:{code?:string}})?.error?.code;
      // Being signed out is the ordinary case here, not a failure, and it gets its own
      // screen rather than an error the visitor cannot act on.
      setState(code==='AUTH_REQUIRED'||code==='INVALID_TOKEN'||code==='INVALID_REFRESH_TOKEN'?'signedOut':'error');
    }
  },[locale]);
  useEffect(()=>{void load();},[load]);

  const head=<View style={styles.pad}>
    <Text style={styles.kicker}>{t('favorites')}</Text>
    <Text accessibilityRole="header" style={styles.title}>{t('favoritesTitle')}</Text>
  </View>;

  if(state==='loading')return <View style={styles.screen}>{head}<ActivityIndicator color={colors.clay} style={{marginTop:spacing.xl}}/></View>;
  if(state==='signedOut')return <View style={styles.screen}>{head}<View style={styles.pad}>
    <Text style={styles.explainer}>{t('favoritesEmpty')}</Text>
    <PrimaryButton label={t('signInTitle')} onPress={onAuth}/>
  </View></View>;
  if(state==='error')return <View style={styles.screen}>{head}<View style={styles.pad}>
    <Text style={styles.explainer}>{t('favoritesError')}</Text>
    <PrimaryButton label={t('retry')} onPress={()=>void load()}/>
  </View></View>;

  return <FlatList
    style={styles.screen}
    contentContainerStyle={{paddingBottom:130}}
    data={stores??[]}
    keyExtractor={store=>store.id}
    ListHeaderComponent={head}
    ListEmptyComponent={<Text style={[styles.explainer,styles.pad]}>{t('favoritesSignedInEmpty')}</Text>}
    renderItem={({item})=><StoreRow store={item} onPress={()=>onStore(item.id)}/>}/>;
}

export function ProfileScreen({signedIn,onAuth,onDeleted}:{signedIn:boolean;onAuth:()=>void;onDeleted:()=>void}) { const {t,locale,setLocale}=useI18n(); const remove=()=>Alert.alert(t('deleteAccountTitle'),t('deleteAccountBody'),[{text:t('cancel'),style:'cancel'},{text:t('deleteAccountConfirm'),style:'destructive',onPress:()=>{void mobileApi.deleteAccount(locale).then(onDeleted).catch(()=>Alert.alert(t('deleteAccountTitle'),t('deleteAccountFailed')));}}]); return <ScrollView style={styles.screen} contentContainerStyle={styles.pad}><Text style={styles.kicker}>{t('profile')}</Text><Text style={styles.title}>{t('profileTitle')}</Text><Text style={styles.explainer}>{t('profileBody')}</Text>{!signedIn&&<PrimaryButton label={t('signInTitle')} onPress={onAuth}/>}<Text style={styles.sectionLabel}>{t('language')}</Text><View style={styles.languages}>{(Object.keys(localeNames) as Locale[]).map(l=><Text accessibilityRole="button" onPress={()=>setLocale(l)} key={l} style={[styles.language,l===locale&&styles.languageActive]}>{localeNames[l]}</Text>)}</View>{signedIn&&<View style={styles.dangerZone}><Text style={styles.panelTitle}>{t('dangerZone')}</Text><Text style={styles.explainer}>{t('deleteAccountBody')}</Text><PrimaryButton label={t('deleteAccountConfirm')} kind="secondary" onPress={remove}/></View>}</ScrollView> }

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.canvas},pad:{padding:spacing.lg,paddingBottom:120},kicker:{fontSize:13,textTransform:'uppercase',letterSpacing:1.7,color:colors.clay,fontFamily:fonts.bold,marginTop:spacing.lg},title:{fontFamily:fonts.bold,fontSize:34,lineHeight:40,color:colors.ink,marginTop:spacing.md},steps:{marginTop:spacing.xxxl,gap:spacing.sm},step:{minHeight:52,backgroundColor:colors.muted,borderRadius:radius.control,paddingHorizontal:spacing.lg,flexDirection:'row',alignItems:'center',gap:spacing.md},stepActive:{backgroundColor:colors.ink},stepDone:{opacity:.6},stepIndex:{fontSize:13,fontFamily:fonts.bold,color:colors.ink},stepText:{fontSize:15,fontFamily:fonts.medium,color:colors.ink},panel:{padding:spacing.lg,backgroundColor:colors.surface,marginTop:spacing.xxl,borderRadius:radius.media},panelTitle:{fontFamily:fonts.semibold,fontSize:18,color:colors.ink},meta:{fontFamily:fonts.body,fontSize:13,color:colors.inkMuted,marginTop:spacing.xs},explainer:{fontFamily:fonts.body,fontSize:16,lineHeight:24,color:colors.inkMuted,marginTop:spacing.xxl},ratingRow:{flexDirection:'row',justifyContent:'space-between',marginVertical:spacing.xxxl},star:{fontSize:42,color:colors.line},textarea:{minHeight:150,textAlignVertical:'top',padding:spacing.lg,borderWidth:1,borderColor:colors.line,borderRadius:radius.control,fontSize:16,color:colors.ink,marginTop:spacing.xxl,backgroundColor:colors.surface},sectionLabel:{fontSize:14,fontFamily:fonts.bold,color:colors.ink,marginTop:spacing.xxxl},languages:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,marginTop:spacing.md},language:{paddingHorizontal:spacing.md,paddingVertical:spacing.sm,borderWidth:1,borderColor:colors.line,borderRadius:radius.pill,color:colors.ink},languageActive:{backgroundColor:colors.ink,color:colors.surface},dangerZone:{marginTop:spacing.xxxl,padding:spacing.lg,borderWidth:1,borderColor:'#c98a84',borderRadius:radius.media}});
