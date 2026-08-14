import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '../api/types';
import { imagery } from '../data/fixtures';
import { useI18n } from '../i18n';
import { colors, spacing } from '../theme/tokens';
import { Icon } from './Icon';
import { Rating, VerifiedBadge } from './Primitives';

export function PostCard({post,onProtected,onStore}:{post:Post;onProtected:()=>void;onStore:()=>void}) {
  const {t,locale}=useI18n(); const [liked,setLiked]=useState(post.viewer_has_liked); const [saved,setSaved]=useState(post.viewer_has_favorited_store);
  const date=new Intl.DateTimeFormat(locale,{day:'numeric',month:'short'}).format(new Date(post.created_at));
  return <View style={styles.card}>
    <View style={styles.userRow}><View style={styles.avatar}><Text style={styles.avatarText}>D</Text></View><View style={{flex:1}}><Text style={styles.name}>{post.display_name}</Text><Text style={styles.handle}>@{post.username} · {date}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={saved?t('saved'):t('save')} onPress={()=>{onProtected();setSaved(!saved)}} hitSlop={10}><Icon name="bookmark" color={saved?colors.accent:colors.ink}/></Pressable></View>
    <Pressable onPress={onStore}><View style={styles.storeLine}><Text numberOfLines={1} style={styles.store}>{post.store_name}</Text><Text style={styles.place}>{post.store_district}, {post.store_city}</Text></View></Pressable>
    <View style={styles.mediaFrame}><Image source={imagery.store} style={styles.media} accessibilityLabel={post.store_name}/><View style={styles.mediaIndex}><Text style={styles.mediaIndexText}>1 / {post.media.length}</Text></View></View>
    <View style={styles.meta}><Rating value={post.rating}/><VerifiedBadge/></View>
    <Text style={styles.body}>{post.text}</Text>
    <View style={styles.actions}><Pressable style={styles.action} onPress={()=>{onProtected();setLiked(!liked)}} accessibilityLabel={t('likes')}><Icon name="heart" color={liked?colors.accent:colors.ink}/><Text style={styles.actionText}>{post.like_count+(liked?1:0)}</Text></Pressable><Pressable style={styles.action} onPress={onProtected}><Icon name="comment"/><Text style={styles.actionText}>{post.comment_count}</Text></Pressable><Pressable style={styles.action} onPress={()=>{}}><Icon name="share"/><Text style={styles.actionText}>{t('share')}</Text></Pressable></View>
  </View>;
}
const styles=StyleSheet.create({card:{paddingVertical:spacing.xl},userRow:{flexDirection:'row',alignItems:'center',gap:spacing.md,paddingHorizontal:spacing.lg},avatar:{width:40,height:40,borderRadius:20,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'},avatarText:{color:colors.white,fontSize:17,fontWeight:'700'},name:{fontSize:15,fontWeight:'700',color:colors.ink},handle:{fontSize:13,color:colors.inkMuted,marginTop:2},storeLine:{paddingHorizontal:spacing.lg,marginTop:spacing.md,marginBottom:spacing.md},store:{fontSize:20,lineHeight:25,fontWeight:'700',color:colors.ink},place:{fontSize:13,color:colors.inkMuted,marginTop:2},mediaFrame:{marginHorizontal:spacing.lg,aspectRatio:16/11,borderRadius:14,overflow:'hidden',backgroundColor:colors.muted,position:'relative'},media:{width:'100%',height:'100%',resizeMode:'cover'},mediaIndex:{position:'absolute',right:10,top:10,backgroundColor:'rgba(38,37,33,.78)',paddingHorizontal:8,paddingVertical:5,borderRadius:999},mediaIndexText:{fontSize:10,lineHeight:12,color:colors.surface,fontWeight:'700'},meta:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:spacing.lg,marginTop:spacing.md},body:{fontSize:16,lineHeight:24,color:colors.ink,paddingHorizontal:spacing.lg,marginTop:spacing.md},actions:{flexDirection:'row',alignItems:'center',gap:spacing.xxl,paddingHorizontal:spacing.lg,marginTop:spacing.md},action:{minHeight:44,flexDirection:'row',alignItems:'center',gap:spacing.sm},actionText:{fontSize:13,color:colors.inkMuted}});
