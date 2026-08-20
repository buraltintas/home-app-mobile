import React, { useState } from 'react';
import * as Location from 'expo-location';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { mobileApi } from '../api/client';
import type { Store } from '../api/types';
import { PrimaryButton, SearchField } from '../components/Primitives';
import { StoreRow } from '../components/StoreRow';
import { useI18n } from '../i18n';
import { colors, fonts, radius, spacing } from '../theme/tokens';

// Writing a review has one hard requirement the product will not bend on: the visit is
// verified by being there. Everything else about this screen serves that -- pick the store
// you are standing in, prove the proximity, then say what you found.
//
// The store is chosen from the real catalogue. It used to be a constant, so every review
// written from a phone was attached to the same store whatever the author had visited.
type Step='store'|'visit'|'review';

export function CreateScreen({onAuth}:{onAuth:()=>void}) {
  const {t,locale}=useI18n();
  const [step,setStep]=useState<Step>('store');
  const [store,setStore]=useState<Store|null>(null);
  const [query,setQuery]=useState('');
  const [candidates,setCandidates]=useState<Store[]|null>(null);
  const [searching,setSearching]=useState(false);
  const [proofId,setProofId]=useState<string>();
  const [rating,setRating]=useState(0);
  const [text,setText]=useState('');
  const [busy,setBusy]=useState(false);

  const nearby=async()=>{
    setSearching(true);
    try{
      const permission=await Location.requestForegroundPermissionsAsync();
      if(permission.status!=='granted'){Alert.alert(t('locationStep'),t('locationWhy'));return;}
      const fix=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
      const result=await mobileApi.storesNearby({latitude:fix.coords.latitude,longitude:fix.coords.longitude},locale);
      setCandidates(result.items??[]);
    }catch{setCandidates([]);}
    finally{setSearching(false);}
  };

  const byName=async()=>{
    if(query.trim().length<2)return;
    setSearching(true);
    try{const result=await mobileApi.storeSearch(query.trim(),locale);setCandidates(result.items??[]);}
    catch{setCandidates([]);}
    finally{setSearching(false);}
  };

  // Proximity is checked against the store the author chose, and only distance and the
  // device's own accuracy reading leave the phone. The coordinates are not stored.
  const verify=async()=>{
    if(!store)return;
    setBusy(true);
    try{
      const permission=await Location.requestForegroundPermissionsAsync();
      if(permission.status!=='granted'){Alert.alert(t('locationStep'),t('locationWhy'));return;}
      const fix=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});
      if(!fix.coords.accuracy||fix.coords.accuracy>100){Alert.alert(t('locationStep'),t('locationAccuracy'));return;}
      const proof=await mobileApi.verifyVisit(store.id,{latitude:fix.coords.latitude,longitude:fix.coords.longitude,accuracy_meters:fix.coords.accuracy},locale);
      setProofId(proof.id);setStep('review');
    }catch(reason){
      const code=(reason as {error?:{code?:string}})?.error?.code;
      if(code==='AUTH_REQUIRED'||code==='INVALID_TOKEN'||code==='INVALID_REFRESH_TOKEN'){onAuth();return;}
      Alert.alert(t('locationStep'),t('visitVerificationFailed'));
    }finally{setBusy(false);}
  };

  const publish=async()=>{
    if(!store||!proofId||rating<1||text.trim().length<3)return;
    setBusy(true);
    try{
      await mobileApi.createReview({store_id:store.id,text:text.trim(),rating,visit_verification_id:proofId,content_language:locale},locale);
      await mobileApi.clearVisitProof(store.id);
      Alert.alert(t('createTitle'),t('published'));
      setStep('store');setStore(null);setProofId(undefined);setRating(0);setText('');setCandidates(null);setQuery('');
    }catch(reason){
      const code=(reason as {error?:{code?:string}})?.error?.code;
      if(code==='AUTH_REQUIRED'||code==='INVALID_TOKEN'||code==='INVALID_REFRESH_TOKEN'){onAuth();return;}
      Alert.alert(t('createTitle'),t('publishFailed'));
    }finally{setBusy(false);}
  };

  const head=<View style={styles.pad}>
    <Text style={styles.kicker}>{t('create')}</Text>
    <Text accessibilityRole="header" style={styles.title}>{t('createTitle')}</Text>
    <Text style={styles.explainer}>{t('createIntro')}</Text>
  </View>;

  if(step==='store')return <FlatList
    style={styles.screen}
    contentContainerStyle={{paddingBottom:130}}
    data={candidates??[]}
    keyExtractor={item=>item.id}
    keyboardShouldPersistTaps="handled"
    ListHeaderComponent={<>
      {head}
      <View style={styles.pad}>
        <SearchField value={query} onChange={setQuery} onSubmit={()=>void byName()} placeholder={t('selectStore')}/>
        <PrimaryButton label={t('nearby')} kind="secondary" onPress={()=>void nearby()}/>
        {searching&&<ActivityIndicator color={colors.clay} style={{marginTop:spacing.lg}}/>}
      </View>
    </>}
    ListEmptyComponent={candidates&&!searching?<Text style={[styles.explainer,styles.pad]}>{t('noStoresFound')}</Text>:null}
    renderItem={({item})=><StoreRow store={item} onPress={()=>{setStore(item);setStep('visit');}}/>}/>;

  return <ScrollView style={styles.screen} contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
    {head}
    <View style={styles.chosen}>
      <Text style={styles.chosenName}>{store?.name}</Text>
      <Text style={styles.meta}>{[store?.district,store?.city].filter(Boolean).join(', ')}</Text>
      <Pressable onPress={()=>{setStep('store');setStore(null);setProofId(undefined);}} accessibilityRole="button">
        <Text style={styles.change}>{t('change')}</Text>
      </Pressable>
    </View>

    {step==='visit'&&<View style={styles.block}>
      <Text style={styles.explainer}>{t('locationWhy')}</Text>
      <PrimaryButton label={busy?'…':t('verifyLocation')} disabled={busy} onPress={()=>void verify()}/>
    </View>}

    {step==='review'&&<View style={styles.block}>
      <Text style={styles.verified}>{t('verifyDone')}</Text>
      <View style={styles.ratingRow}>
        {[1,2,3,4,5].map(value=>
          <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value}`} onPress={()=>setRating(value)} hitSlop={8}>
            <Text style={[styles.star,value<=rating&&{color:colors.clay}]}>★</Text>
          </Pressable>)}
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder={t('experienceStep')}
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
        accessibilityLabel={t('experienceStep')}/>
      <PrimaryButton label={busy?'…':t('publish')} disabled={busy||rating<1||text.trim().length<3} onPress={()=>void publish()}/>
    </View>}
  </ScrollView>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.canvas},
  pad:{padding:spacing.lg,paddingBottom:spacing.xl},
  kicker:{fontFamily:fonts.semibold,fontSize:12,letterSpacing:1,textTransform:'uppercase',color:colors.clay},
  title:{fontFamily:fonts.bold,fontSize:30,lineHeight:34,color:colors.ink,letterSpacing:-1,marginTop:spacing.sm},
  explainer:{fontFamily:fonts.body,fontSize:16,lineHeight:24,color:colors.inkMuted,marginTop:spacing.md},
  chosen:{backgroundColor:colors.surface,borderRadius:radius.media,borderWidth:1,borderColor:colors.line,padding:spacing.lg,gap:4,marginTop:spacing.sm},
  chosenName:{fontFamily:fonts.semibold,fontSize:19,color:colors.ink,letterSpacing:-.3},
  meta:{fontFamily:fonts.body,fontSize:14,color:colors.inkMuted},
  change:{fontFamily:fonts.medium,fontSize:14,color:colors.clay,marginTop:spacing.sm},
  block:{marginTop:spacing.xl,gap:spacing.md},
  verified:{fontFamily:fonts.semibold,fontSize:15,color:colors.success},
  ratingRow:{flexDirection:'row',gap:spacing.sm},
  star:{fontSize:38,color:colors.line,paddingHorizontal:2},
  input:{minHeight:150,textAlignVertical:'top',padding:spacing.md,borderWidth:1,borderColor:colors.lineStrong,borderRadius:radius.control,backgroundColor:colors.surface,fontFamily:fonts.body,fontSize:16,lineHeight:24,color:colors.ink},
});
