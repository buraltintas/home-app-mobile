import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { mobileApi } from '../api/client';
import type { Store } from '../api/types';
import { PrimaryButton, SearchField } from '../components/Primitives';
import { StoreRow } from '../components/StoreRow';
import { useI18n } from '../i18n';
import { uploadPhoto } from '../lib/uploadPhoto';
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
  const [photos,setPhotos]=useState<string[]>([]);
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


  const addPhoto=async()=>{
    const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permission.granted){Alert.alert(t('createTitle'),t('photoPermission'));return;}
    const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:.8,selectionLimit:1});
    if(result.canceled||result.assets.length===0)return;
    setPhotos(current=>[...current,result.assets[0].uri].slice(0,10));
  };

  const publish=async()=>{
    if(!store||!proofId||rating<1||text.trim().length<3)return;
    setBusy(true);
    try{
      // Photographs are uploaded before the review so a failure here means no review with
      // missing pictures -- it means no review yet, and the author still has their text.
      const mediaIds:string[]=[];
      for(const uri of photos)mediaIds.push(await uploadPhoto(uri,locale));
      await mobileApi.createReview({store_id:store.id,text:text.trim(),rating,media_ids:mediaIds,visit_verification_id:proofId,content_language:locale},locale);
      await mobileApi.clearVisitProof(store.id);
      Alert.alert(t('createTitle'),t('published'));
      setStep('store');setStore(null);setProofId(undefined);setRating(0);setText('');setPhotos([]);setCandidates(null);setQuery('');
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
      <View style={styles.photos}>
        {photos.map(uri=><View key={uri} style={styles.photo}>
          <Image source={{uri}} style={styles.photoImage}/>
          <Pressable accessibilityRole="button" accessibilityLabel={t('removePhoto')} hitSlop={8}
            onPress={()=>setPhotos(current=>current.filter(item=>item!==uri))} style={styles.photoRemove}>
            <Text style={styles.photoRemoveText}>×</Text>
          </Pressable>
        </View>)}
        {photos.length<10&&<Pressable accessibilityRole="button" onPress={()=>void addPhoto()} style={styles.photoAdd}>
          <Text style={styles.photoAddText}>+</Text>
        </Pressable>}
      </View>
      <Text style={styles.explainer}>{t('photoNote')}</Text>
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
  photos:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},photo:{width:88,height:88,borderRadius:radius.small+4,overflow:'hidden',backgroundColor:colors.muted},photoImage:{width:'100%',height:'100%'},photoRemove:{position:'absolute',top:0,right:0,width:30,height:30,alignItems:'center',justifyContent:'center',backgroundColor:colors.ink},photoRemoveText:{color:colors.surface,fontSize:18,lineHeight:20,fontFamily:fonts.semibold},photoAdd:{width:88,height:88,borderRadius:radius.small+4,borderWidth:1,borderColor:colors.lineStrong,alignItems:'center',justifyContent:'center'},photoAddText:{fontSize:30,color:colors.inkMuted,fontFamily:fonts.body},star:{fontSize:38,color:colors.line,paddingHorizontal:2},
  input:{minHeight:150,textAlignVertical:'top',padding:spacing.md,borderWidth:1,borderColor:colors.lineStrong,borderRadius:radius.control,backgroundColor:colors.surface,fontFamily:fonts.body,fontSize:16,lineHeight:24,color:colors.ink},
});
