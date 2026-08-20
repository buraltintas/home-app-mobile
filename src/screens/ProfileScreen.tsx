import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { clearSession, mobileApi } from '../api/client';
import type { Locale, PrivateProfile, SearchHistoryEntry } from '../api/types';
import { Icon } from '../components/Icon';
import { PrimaryButton } from '../components/Primitives';
import { FeedbackScreen } from './FeedbackScreen';
import { localeNames, useI18n } from '../i18n';
import { colors, fonts, radius, spacing } from '../theme/tokens';

// Standing follows the content: the level is derived from published reviews, so it cannot
// disagree with the number beside it.
const LEVEL_KEYS=['levelNew','levelExplorer','levelRegular','levelGuide','levelExpert'] as const;

export function ProfileScreen({signedIn,onAuth,onDeleted,onStore}:{
  signedIn:boolean;onAuth:()=>void;onDeleted:()=>void;onStore:(storeId:string)=>void;
}) {
  const {t,locale,setLocale}=useI18n();
  const [me,setMe]=useState<PrivateProfile|null>(null);
  const [history,setHistory]=useState<SearchHistoryEntry[]>([]);
  const [loading,setLoading]=useState(true);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [feedbackOpen,setFeedbackOpen]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const profile=await mobileApi.me(locale);
      setMe(profile);
      try{const result=await mobileApi.searches(locale);setHistory(result.items??[]);}catch{setHistory([]);}
    }catch{setMe(null);}
    finally{setLoading(false);}
  },[locale]);
  useEffect(()=>{void load();},[load,signedIn]);

  const signOut=async()=>{
    try{await mobileApi.logout(locale);}catch{await clearSession();}
    setMe(null);setHistory([]);onDeleted();
  };

  const remove=()=>Alert.alert(t('deleteAccountTitle'),t('deleteAccountBody'),[
    {text:t('cancel'),style:'cancel'},
    {text:t('deleteAccountConfirm'),style:'destructive',onPress:()=>{
      void mobileApi.deleteAccount(locale).then(onDeleted).catch(()=>Alert.alert(t('deleteAccountTitle'),t('deleteAccountFailed')));
    }},
  ]);

  const head=<>
    <Text style={styles.kicker}>{t('profile')}</Text>
    <Text accessibilityRole="header" style={styles.title}>{t('profileTitle')}</Text>
  </>;

  if(loading)return <View style={[styles.screen,styles.pad]}>{head}<ActivityIndicator color={colors.clay} style={{marginTop:spacing.xl}}/></View>;

  if(!me)return <ScrollView style={styles.screen} contentContainerStyle={styles.pad}>
    {head}
    <Text style={styles.explainer}>{t('profileBody')}</Text>
    <PrimaryButton label={t('signInTitle')} onPress={onAuth}/>
    <Pressable onPress={()=>setFeedbackOpen(true)} accessibilityRole="button" style={styles.panelHead}>
      <View style={{flex:1}}><Text style={styles.panelTitle}>{t('feedback')}</Text></View>
      <Icon name="arrow" size={18} color={colors.inkMuted}/>
    </Pressable>
    <FeedbackScreen visible={feedbackOpen} onClose={()=>setFeedbackOpen(false)}/>
    <LanguageRow locale={locale} setLocale={setLocale} label={t('language')}/>
  </ScrollView>;

  const level=Math.min(Math.max(me.level??0,0),LEVEL_KEYS.length-1);

  return <ScrollView style={styles.screen} contentContainerStyle={styles.pad}>
    {head}

    <View style={styles.card}>
      <View style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(me.display_name||me.username||me.email).slice(0,1).toLocaleUpperCase(locale)}</Text></View>
        <View style={{flex:1,minWidth:0}}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.name}>{me.display_name||me.username}</Text>
            {me.post_count>0&&<Text style={styles.level}>{t(LEVEL_KEYS[level])}</Text>}
          </View>
          <Text numberOfLines={1} style={styles.handle}>@{me.username}</Text>
          <Text numberOfLines={1} style={styles.handle}>{me.email}</Text>
        </View>
      </View>
      <View style={styles.stats}>
        {[[me.post_count,t('profileReviews')],[me.favorite_count,t('favorites')],[me.follower_count,t('followers')],[me.following_count,t('following')]]
          .map(([value,label])=><View key={String(label)} style={styles.stat}>
            <Text style={styles.statValue}>{String(value)}</Text>
            <Text style={styles.statLabel}>{String(label)}</Text>
          </View>)}
      </View>
    </View>

    {/* Search history is long and personal, so it opens on request rather than filling the
        screen with a list nobody asked to see. */}
    <Pressable onPress={()=>setHistoryOpen(open=>!open)} accessibilityRole="button" style={styles.panelHead}>
      <View style={{flex:1}}>
        <Text style={styles.panelTitle}>{t('pastSearches')}</Text>
        <Text style={styles.panelHint}>{history.length>0?`${history.length}`:t('pastSearchesEmpty')}</Text>
      </View>
      <Icon name="arrow" size={18} color={colors.inkMuted}/>
    </Pressable>
    {historyOpen&&history.map(entry=><View key={entry.id} style={styles.entry}>
      <View style={styles.entryHead}>
        <Text style={styles.entryQuery}>{entry.raw_query}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t('deleteSearch')} hitSlop={10}
          onPress={()=>{void mobileApi.deleteSearch(entry.id,locale).then(()=>setHistory(current=>current.filter(item=>item.id!==entry.id))).catch(()=>undefined);}}>
          <Icon name="close" size={18} color={colors.inkMuted}/>
        </Pressable>
      </View>
      {entry.results.slice(0,3).map(result=>
        <Pressable key={result.store_id} onPress={()=>onStore(result.store_id)} accessibilityRole="button">
          <Text style={styles.entryResult}>{result.name}</Text>
        </Pressable>)}
    </View>)}

    <Pressable onPress={()=>setFeedbackOpen(true)} accessibilityRole="button" style={styles.panelHead}>
      <View style={{flex:1}}><Text style={styles.panelTitle}>{t('feedback')}</Text></View>
      <Icon name="arrow" size={18} color={colors.inkMuted}/>
    </Pressable>
    <FeedbackScreen visible={feedbackOpen} onClose={()=>setFeedbackOpen(false)}/>
    <LanguageRow locale={locale} setLocale={setLocale} label={t('language')}/>

    <View style={styles.account}>
      <PrimaryButton label={t('signOut')} kind="secondary" onPress={()=>void signOut()}/>
      <Text style={styles.danger}>{t('deleteAccountBody')}</Text>
      <PrimaryButton label={t('deleteAccountConfirm')} kind="quiet" onPress={remove}/>
    </View>
  </ScrollView>;
}

function LanguageRow({locale,setLocale,label}:{locale:Locale;setLocale:(next:Locale)=>void;label:string}) {
  return <View style={styles.languages}>
    <Text style={styles.panelTitle}>{label}</Text>
    <View style={styles.languageRow}>
      {(Object.keys(localeNames) as Locale[]).map(code=>
        <Pressable key={code} accessibilityRole="button" accessibilityState={{selected:code===locale}} onPress={()=>setLocale(code)}
          style={[styles.language,code===locale&&styles.languageActive]}>
          <Text style={[styles.languageText,code===locale&&{color:colors.surface}]}>{localeNames[code]}</Text>
        </Pressable>)}
    </View>
  </View>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.canvas},
  pad:{padding:spacing.lg,paddingBottom:130},
  kicker:{fontFamily:fonts.semibold,fontSize:12,letterSpacing:1,textTransform:'uppercase',color:colors.clay},
  title:{fontFamily:fonts.bold,fontSize:30,lineHeight:34,color:colors.ink,letterSpacing:-1,marginTop:spacing.sm},
  explainer:{fontFamily:fonts.body,fontSize:16,lineHeight:24,color:colors.inkMuted,marginTop:spacing.md,marginBottom:spacing.sm},
  card:{marginTop:spacing.xl,backgroundColor:colors.surface,borderRadius:radius.media,borderWidth:1,borderColor:colors.line,padding:spacing.lg,gap:spacing.lg},
  identity:{flexDirection:'row',alignItems:'center',gap:spacing.md},
  avatar:{width:56,height:56,borderRadius:radius.pill,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center'},
  avatarText:{fontFamily:fonts.bold,fontSize:22,color:colors.surface},
  nameRow:{flexDirection:'row',alignItems:'center',gap:spacing.sm,flexWrap:'wrap'},
  name:{fontFamily:fonts.semibold,fontSize:19,color:colors.ink,letterSpacing:-.3},
  level:{fontFamily:fonts.semibold,fontSize:10,letterSpacing:.8,textTransform:'uppercase',color:colors.accentInk,backgroundColor:colors.accentWash,borderRadius:radius.small,paddingHorizontal:6,paddingVertical:2},
  handle:{fontFamily:fonts.body,fontSize:14,color:colors.inkMuted},
  stats:{flexDirection:'row',justifyContent:'space-between',borderTopWidth:1,borderTopColor:colors.line,paddingTop:spacing.md},
  stat:{alignItems:'flex-start',gap:2},
  statValue:{fontFamily:fonts.bold,fontSize:20,color:colors.ink,letterSpacing:-.5},
  statLabel:{fontFamily:fonts.body,fontSize:12,color:colors.inkMuted},
  panelHead:{flexDirection:'row',alignItems:'center',gap:spacing.md,marginTop:spacing.xl,paddingVertical:spacing.md,borderTopWidth:1,borderTopColor:colors.line},
  panelTitle:{fontFamily:fonts.semibold,fontSize:17,color:colors.ink,letterSpacing:-.2},
  panelHint:{fontFamily:fonts.body,fontSize:14,color:colors.inkMuted,marginTop:2},
  entry:{paddingVertical:spacing.md,borderTopWidth:1,borderTopColor:colors.line,gap:4},
  entryHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.md},
  entryQuery:{fontFamily:fonts.medium,fontSize:16,color:colors.ink,flex:1},
  entryResult:{fontFamily:fonts.body,fontSize:14,color:colors.inkMuted,paddingVertical:4},
  languages:{marginTop:spacing.xl,paddingTop:spacing.lg,borderTopWidth:1,borderTopColor:colors.line,gap:spacing.md},
  languageRow:{flexDirection:'row',gap:spacing.sm,flexWrap:'wrap'},
  language:{minHeight:44,paddingHorizontal:spacing.lg,justifyContent:'center',borderRadius:radius.pill,borderWidth:1,borderColor:colors.lineStrong},
  languageActive:{backgroundColor:colors.ink,borderColor:colors.ink},
  languageText:{fontFamily:fonts.medium,fontSize:15,color:colors.ink},
  account:{marginTop:spacing.xl,paddingTop:spacing.lg,borderTopWidth:1,borderTopColor:colors.line,gap:spacing.sm},
  danger:{fontFamily:fonts.body,fontSize:14,lineHeight:21,color:colors.inkMuted,marginTop:spacing.sm},
});
