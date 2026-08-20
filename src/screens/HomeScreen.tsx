import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { mobileApi } from '../api/client';
import type { Post } from '../api/types';
import { PostCard } from '../components/PostCard';
import { useI18n } from '../i18n';
import { colors, fonts, radius, spacing } from '../theme/tokens';

const brandLogo=require('../../assets/brand/brand-logo-transparent.png');

export function HomeScreen({onAuth,onStore}:{onAuth:()=>void;onStore:()=>void}) {
  const {t,locale}=useI18n();const [posts,setPosts]=useState<Post[]|null>(null);const [error,setError]=useState(false);
  const load=useCallback(async()=>{setError(false);try{const feed=await mobileApi.feed(locale);setPosts(feed.items);}catch{setPosts(null);setError(true);}},[locale]);
  useEffect(()=>{void load();},[load]);
  const hero=<View style={styles.hero}><View style={styles.masthead}><Image source={brandLogo} accessibilityLabel={`${t('wordmark')} logo`} style={styles.logo}/><View style={styles.brandCopy}><Text style={styles.brand}>{t('wordmark')}</Text><Text style={styles.section}>{t('home')}</Text></View></View><Text style={styles.title}>{t('feedTitle')}</Text><Text style={styles.intro}>{t('feedIntro')}</Text></View>;
  const state=posts===null&&!error?<View style={styles.state}><ActivityIndicator color={colors.clay}/><Text style={styles.stateText}>{t('feedLoading')}</Text></View>:error?<View style={styles.state}><Text accessibilityRole="header" style={styles.stateTitle}>{t('feedErrorTitle')}</Text><Text style={styles.stateText}>{t('feedErrorBody')}</Text><Pressable accessibilityRole="button" onPress={()=>void load()} style={({pressed})=>[styles.retry,pressed&&styles.pressed]}><Text style={styles.retryText}>{t('retry')}</Text></Pressable></View>:posts?.length===0?<View style={styles.state}><Text accessibilityRole="header" style={styles.stateTitle}>{t('feedEmptyTitle')}</Text><Text style={styles.stateText}>{t('feedEmptyBody')}</Text></View>:null;
  return <FlatList style={styles.screen} contentContainerStyle={styles.content} data={posts??[]} keyExtractor={post=>post.id} ListHeaderComponent={hero} ListEmptyComponent={state} renderItem={({item})=><PostCard post={item} onProtected={onAuth} onStore={onStore}/>} />;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.canvas},content:{paddingBottom:112,flexGrow:1},hero:{paddingHorizontal:spacing.lg,paddingTop:spacing.sm,paddingBottom:spacing.lg},masthead:{minHeight:66,flexDirection:'row',alignItems:'center'},logo:{width:58,height:58,resizeMode:'contain',transform:[{rotate:'-3deg'}]},brandCopy:{marginLeft:spacing.sm,flex:1},brand:{fontFamily:fonts.bold,fontSize:15,lineHeight:18,color:colors.ink,letterSpacing:-.6},section:{fontFamily:fonts.bold,fontSize:10,lineHeight:14,color:colors.clay,textTransform:'uppercase',letterSpacing:1.2,marginTop:2},title:{fontFamily:fonts.bold,fontSize:34,lineHeight:39,color:colors.ink,letterSpacing:-1.3,marginTop:spacing.xl,maxWidth:350},intro:{fontFamily:fonts.body,fontSize:15,lineHeight:23,color:colors.inkMuted,marginTop:spacing.md,maxWidth:350},state:{padding:spacing.xl,alignItems:'flex-start',gap:spacing.sm},stateTitle:{fontFamily:fonts.bold,fontSize:20,lineHeight:27,color:colors.ink,letterSpacing:-.6},stateText:{fontFamily:fonts.body,fontSize:15,lineHeight:22,color:colors.inkMuted},retry:{minHeight:44,paddingHorizontal:spacing.lg,justifyContent:'center',borderWidth:1,borderColor:colors.line,borderRadius:radius.control,marginTop:spacing.sm,backgroundColor:colors.accentWash},retryText:{fontFamily:fonts.bold,fontSize:15,color:colors.ink},pressed:{opacity:.65}});
