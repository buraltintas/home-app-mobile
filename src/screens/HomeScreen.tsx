import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { PostCard } from '../components/PostCard';
import { feedPost } from '../data/fixtures';
import { useI18n } from '../i18n';
import { colors, spacing } from '../theme/tokens';

const brandLogo=require('../../assets/brand/bosagezme-logo.png');
export function HomeScreen({onAuth,onStore}:{onAuth:()=>void;onStore:()=>void}) { const {t}=useI18n(); return <FlatList style={styles.screen} contentContainerStyle={styles.content} data={[feedPost]} keyExtractor={p=>p.id} ListHeaderComponent={<View style={styles.hero}><Image source={brandLogo} accessibilityLabel={`${t('wordmark')} logo`} style={styles.logo}/><Text style={styles.title}>{t('feedTitle')}</Text><Text style={styles.intro}>{t('feedIntro')}</Text></View>} renderItem={({item})=><PostCard post={item} onProtected={onAuth} onStore={onStore}/>} />; }
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.canvas},content:{paddingBottom:112},hero:{paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:spacing.sm},logo:{width:92,height:92,borderRadius:46},title:{fontSize:30,lineHeight:35,color:colors.ink,fontWeight:'700',marginTop:spacing.sm,maxWidth:340},intro:{fontSize:15,lineHeight:22,color:colors.inkMuted,marginTop:spacing.sm,maxWidth:350}});
