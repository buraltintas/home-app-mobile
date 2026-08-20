import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { mobileApi, mobilePlacePhotoSource } from '../api/client';
import type { StoreDetail } from '../api/types';
import { Icon } from '../components/Icon';
import { PostCard } from '../components/PostCard';
import { PrimaryButton, Rating } from '../components/Primitives';
import { useI18n } from '../i18n';
import { colors, fonts, radius, spacing } from '../theme/tokens';

// The page answers one question -- is this worth the trip -- so the photograph, the identity
// and the four controls that act on the answer come first, and everything else follows.
export function StoreScreen({storeId,onBack,onAuth}:{storeId:string;onBack:()=>void;onAuth:()=>void}) {
  const {t,locale}=useI18n();
  const [data,setData]=useState<StoreDetail|null>(null);
  const [error,setError]=useState(false);
  const [saved,setSaved]=useState(false);
  const [busy,setBusy]=useState(false);

  const load=useCallback(async()=>{
    setError(false);
    try{const detail=await mobileApi.store(storeId,locale);setData(detail);setSaved(detail.store.viewer_has_favorited);}
    catch{setData(null);setError(true);}
  },[storeId,locale]);
  useEffect(()=>{void load();},[load]);

  if(error)return <View style={styles.screen}><View style={styles.state}>
    <Text accessibilityRole="header" style={styles.stateTitle}>{t('storeUnavailable')}</Text>
    <PrimaryButton label={t('retry')} onPress={()=>void load()}/>
    <PrimaryButton label={t('back')} kind="quiet" onPress={onBack}/>
  </View></View>;

  if(!data)return <View style={styles.screen}><View style={styles.state}><ActivityIndicator color={colors.clay}/></View></View>;

  const {store,recent_posts:posts}=data;
  const google=store.external_sources?.find(source=>source.provider==='google');
  const photo=typeof google?.attribution?.photo_name==='string'?google.attribution.photo_name as string:undefined;
  const km=store.distance_meters===undefined?null:(store.distance_meters/1000).toLocaleString(locale,{maximumFractionDigits:1});
  const rating=Number(google?.attribution?.rating??0);
  const ratingCount=Number(google?.attribution?.rating_count??0);

  // An optimistic flip is not success: only a resolved request keeps it.
  const toggleSave=async()=>{
    if(busy)return; const next=!saved; setBusy(true); setSaved(next);
    try{await mobileApi.favorite(store.id,locale,saved);}
    catch(reason){setSaved(!next);const code=(reason as {error?:{code?:string}})?.error?.code;
      if(code==='AUTH_REQUIRED'||code==='INVALID_TOKEN'||code==='INVALID_REFRESH_TOKEN')onAuth();}
    finally{setBusy(false);}
  };
  const directions=()=>void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}&query_place_id=${google?.external_id??''}`);
  const share=()=>void Share.share({message:`${store.name} · ${store.address}`,url:`https://bosagezme.com/stores/${store.slug}`});

  const action=(name:string,label:string,onPress:()=>void,active=false)=>
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({pressed})=>[styles.action,pressed&&{opacity:.65}]}>
      <Icon name={name} color={active?colors.clay:colors.ink}/><Text style={styles.actionText}>{label}</Text>
    </Pressable>;

  return <ScrollView style={styles.screen} contentContainerStyle={{paddingBottom:130}}>
    <View>
      {photo
        ?<Image source={mobilePlacePhotoSource(photo,1200)} style={styles.hero} accessibilityLabel={store.name}/>
        :<View style={[styles.hero,styles.heroEmpty]}><Text style={styles.heroMark}>{store.name.trim().slice(0,1)}</Text><Text style={styles.heroText}>{t('noPhoto')}</Text></View>}
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={t('back')} style={styles.float}><Icon name="back" size={26}/></Pressable>
    </View>

    <View style={styles.content}>
      {store.category_labels.length>0&&<Text style={styles.kicker}>{store.category_labels.join(' · ')}</Text>}
      <Text accessibilityRole="header" style={styles.title}>{store.name}</Text>
      <Text style={styles.address}>{[store.district,store.city].filter(Boolean).join(', ')||store.address}</Text>
      {km&&<Text style={styles.distance}>{km} km</Text>}

      {/* Community figures and provider figures stay in separate columns and are labelled
          separately. Blending them would be inventing a number neither source reported. */}
      <View style={styles.scores}>
        <View style={styles.score}>
          <Text style={styles.scoreLabel}>{t('wordmark')}</Text>
          {store.platform.review_count>0
            ?<><Rating value={store.platform.average_rating} size="large"/><Text style={styles.scoreMeta}>{store.platform.review_count} {t('reviews')}</Text></>
            :<><Text style={styles.scoreEmpty}>—</Text><Text style={styles.scoreMeta}>{t('noCommunity')}</Text></>}
        </View>
        {ratingCount>0&&<View style={styles.score}>
          <Text style={styles.scoreLabel}>Google</Text>
          <Rating value={rating} size="large"/>
          <Text style={styles.scoreMeta}>{ratingCount} {t('reviews')}</Text>
        </View>}
      </View>

      <View style={styles.actions}>
        {action('bookmark',saved?t('saved'):t('save'),()=>void toggleSave(),saved)}
        {action('directions',t('directions'),directions)}
        {action('comment',t('review'),onAuth)}
        {action('share',t('share'),share)}
      </View>

      {store.localized_description?<Text style={styles.description}>{store.localized_description}</Text>:null}
    </View>

    <View style={styles.reviews}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{t('community')}</Text>
      {posts.length===0
        ?<Text style={styles.empty}>{t('noReviewsBody')}</Text>
        :posts.map(post=><PostCard key={post.id} post={post} onProtected={onAuth} onStore={()=>{}}/>)}
    </View>
  </ScrollView>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.canvas},
  state:{flex:1,padding:spacing.xl,gap:spacing.md,alignItems:'flex-start',justifyContent:'center'},
  stateTitle:{fontFamily:fonts.bold,fontSize:24,color:colors.ink,letterSpacing:-.6},
  hero:{width:'100%',aspectRatio:4/3,resizeMode:'cover',backgroundColor:colors.muted},
  heroEmpty:{alignItems:'center',justifyContent:'center',gap:spacing.sm},
  heroMark:{fontFamily:fonts.bold,fontSize:56,color:colors.inkMuted,letterSpacing:-2},
  heroText:{fontFamily:fonts.semibold,fontSize:12,letterSpacing:1,textTransform:'uppercase',color:colors.inkMuted},
  float:{position:'absolute',top:spacing.huge,left:spacing.lg,width:44,height:44,borderRadius:radius.pill,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},
  content:{padding:spacing.lg,paddingTop:spacing.xl},
  kicker:{fontFamily:fonts.semibold,fontSize:12,letterSpacing:1,textTransform:'uppercase',color:colors.clay},
  title:{fontFamily:fonts.bold,fontSize:30,lineHeight:34,color:colors.ink,letterSpacing:-1,marginTop:spacing.sm},
  address:{fontFamily:fonts.body,fontSize:16,color:colors.inkMuted,marginTop:spacing.sm},
  distance:{fontFamily:fonts.medium,fontSize:14,color:colors.clay,marginTop:4},
  scores:{flexDirection:'row',gap:spacing.huge,marginTop:spacing.xl},
  score:{gap:2},
  scoreLabel:{fontFamily:fonts.semibold,fontSize:11,letterSpacing:1,textTransform:'uppercase',color:colors.inkMuted},
  scoreEmpty:{fontFamily:fonts.bold,fontSize:24,color:colors.ink},
  scoreMeta:{fontFamily:fonts.body,fontSize:13,color:colors.inkMuted},
  actions:{flexDirection:'row',justifyContent:'space-between',marginTop:spacing.xl,paddingTop:spacing.lg,borderTopWidth:1,borderTopColor:colors.line},
  action:{minWidth:64,minHeight:56,alignItems:'center',justifyContent:'center',gap:6},
  actionText:{fontFamily:fonts.medium,fontSize:12,color:colors.inkMuted},
  description:{fontFamily:fonts.body,fontSize:17,lineHeight:27,color:colors.ink,marginTop:spacing.xl},
  reviews:{paddingTop:spacing.md},
  sectionTitle:{fontFamily:fonts.semibold,fontSize:20,color:colors.ink,letterSpacing:-.4,paddingHorizontal:spacing.lg,marginBottom:spacing.sm},
  empty:{fontFamily:fonts.body,fontSize:16,color:colors.inkMuted,paddingHorizontal:spacing.lg,paddingBottom:spacing.xl},
});
