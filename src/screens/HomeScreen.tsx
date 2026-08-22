import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { mobileApi } from '../api/client';
import type { Post } from '../api/types';
import { PostCard } from '../components/PostCard';
import { useI18n } from '../i18n';
import { colors, fonts, radius, spacing } from '../theme/tokens';

const brandLogo=require('../../assets/brand/brand-logo-transparent.png');

export function HomeScreen({onAuth,onStore}:{onAuth:()=>void;onStore:(storeId:string)=>void}) {
  const {t,locale}=useI18n();const [posts,setPosts]=useState<Post[]|null>(null);const [error,setError]=useState(false);
  const [cursor,setCursor]=useState('');const [loadingMore,setLoadingMore]=useState(false);
  const load=useCallback(async()=>{setError(false);try{const feed=await mobileApi.feed(locale);setPosts(feed.items);setCursor(feed.next_cursor??'');}catch{setPosts(null);setError(true);setCursor('');}},[locale]);
  useEffect(()=>{void load();},[load]);
  // The API has always returned a cursor and the app never asked for the next page, so the
  // feed simply ended at twenty reviews. A failed page keeps what is already on screen and
  // leaves the cursor alone, so scrolling again tries the same page rather than emptying
  // the list under someone who is reading it.
  const loadMore=useCallback(async()=>{
    if(!cursor||loadingMore)return;
    setLoadingMore(true);
    try{
      const feed=await mobileApi.feed(locale,undefined,cursor);
      setPosts(current=>{
        const seen=new Set((current??[]).map(post=>post.id));
        return [...(current??[]),...(feed.items??[]).filter(post=>!seen.has(post.id))];
      });
      setCursor(feed.next_cursor??'');
    }catch{}
    finally{setLoadingMore(false);}
  },[cursor,loadingMore,locale]);
  const hero=<View style={styles.hero}><View style={styles.masthead}><Image source={brandLogo} accessibilityLabel={`${t('wordmark')} logo`} style={styles.logo}/><View style={styles.brandCopy}><Text style={styles.brand}>{t('wordmark')}</Text><Text style={styles.section}>{t('home')}</Text></View></View><Text style={styles.title}>{t('feedTitle')}</Text><Text style={styles.intro}>{t('feedIntro')}</Text></View>;
  const state=posts===null&&!error?<View style={styles.state}><ActivityIndicator color={colors.clay}/><Text style={styles.stateText}>{t('feedLoading')}</Text></View>:error?<View style={styles.state}><Text accessibilityRole="header" style={styles.stateTitle}>{t('feedErrorTitle')}</Text><Text style={styles.stateText}>{t('feedErrorBody')}</Text><Pressable accessibilityRole="button" onPress={()=>void load()} style={({pressed})=>[styles.retry,pressed&&styles.pressed]}><Text style={styles.retryText}>{t('retry')}</Text></Pressable></View>:posts?.length===0?<View style={styles.state}><Text accessibilityRole="header" style={styles.stateTitle}>{t('feedEmptyTitle')}</Text><Text style={styles.stateText}>{t('feedEmptyBody')}</Text></View>:null;
  const footer=!posts?.length?null:loadingMore
    ?<View style={styles.footer}><ActivityIndicator color={colors.clay}/></View>
    :cursor?null
    :<Text style={styles.end}>{t('feedEnd')}</Text>;
  return <FlatList style={styles.screen} contentContainerStyle={styles.content} data={posts??[]} keyExtractor={post=>post.id} ListHeaderComponent={hero} ListEmptyComponent={state} ListFooterComponent={footer} onEndReached={()=>void loadMore()} onEndReachedThreshold={0.6} renderItem={({item})=><PostCard post={item} onProtected={onAuth} onStore={()=>onStore(item.store_id)}/>} />;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.canvas},content:{paddingBottom:112,flexGrow:1},hero:{paddingHorizontal:spacing.lg,paddingTop:spacing.sm,paddingBottom:spacing.lg},masthead:{minHeight:66,flexDirection:'row',alignItems:'center'},logo:{width:58,height:58,resizeMode:'contain',transform:[{rotate:'-3deg'}]},brandCopy:{marginLeft:spacing.sm,flex:1},brand:{fontFamily:fonts.bold,fontSize:15,lineHeight:18,color:colors.ink,letterSpacing:-.6},section:{fontFamily:fonts.bold,fontSize:10,lineHeight:14,color:colors.clay,textTransform:'uppercase',letterSpacing:1.2,marginTop:2},title:{fontFamily:fonts.bold,fontSize:34,lineHeight:39,color:colors.ink,letterSpacing:-1.3,marginTop:spacing.xl,maxWidth:350},intro:{fontFamily:fonts.body,fontSize:15,lineHeight:23,color:colors.inkMuted,marginTop:spacing.md,maxWidth:350},state:{padding:spacing.xl,alignItems:'flex-start',gap:spacing.sm},stateTitle:{fontFamily:fonts.bold,fontSize:20,lineHeight:27,color:colors.ink,letterSpacing:-.6},stateText:{fontFamily:fonts.body,fontSize:15,lineHeight:22,color:colors.inkMuted},retry:{minHeight:44,paddingHorizontal:spacing.lg,justifyContent:'center',borderWidth:1,borderColor:colors.line,borderRadius:radius.control,marginTop:spacing.sm,backgroundColor:colors.accentWash},retryText:{fontFamily:fonts.bold,fontSize:15,color:colors.ink},pressed:{opacity:.65},footer:{paddingVertical:spacing.xl,alignItems:'center'},end:{fontFamily:fonts.body,fontSize:14,lineHeight:21,color:colors.inkMuted,textAlign:'center',paddingHorizontal:spacing.xl,paddingVertical:spacing.xl}});
