import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { mobileApi } from '../api/client';
import { PrimaryButton } from '../components/Primitives';
import { useI18n } from '../i18n';
import { colors, fonts, radius, spacing } from '../theme/tokens';
import type { TranslationKey } from '../i18n';

const KINDS:{value:string;key:TranslationKey}[]=[
  {value:'suggestion',key:'feedbackKindSuggestion'},
  {value:'problem',key:'feedbackKindProblem'},
  {value:'praise',key:'feedbackKindPraise'},
  {value:'other',key:'feedbackKindOther'},
];

// It asks for as little as it can: what kind of thing this is, the thing itself, and an
// address only if the sender wants an answer.
export function FeedbackScreen({visible,onClose}:{visible:boolean;onClose:()=>void}) {
  const {t,locale}=useI18n();
  const [kind,setKind]=useState('suggestion');
  const [message,setMessage]=useState('');
  const [email,setEmail]=useState('');
  const [busy,setBusy]=useState(false);
  const [sent,setSent]=useState(false);
  const [error,setError]=useState('');

  const submit=async()=>{
    setError('');
    if(message.trim().length<5){setError(t('feedbackTooShort'));return;}
    setBusy(true);
    try{
      await mobileApi.sendFeedback({kind,message:message.trim(),contact_email:email.trim()||undefined},locale);
      setSent(true);setMessage('');setEmail('');
    }catch{setError(t('feedbackError'));}
    finally{setBusy(false);}
  };

  const close=()=>{setSent(false);setError('');onClose();};

  return <Modal visible={visible} animationType="slide" onRequestClose={close}>
    <ScrollView style={styles.screen} contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
      <Text style={styles.kicker}>{t('wordmark')}</Text>
      <Text accessibilityRole="header" style={styles.title}>{t('feedbackTitle')}</Text>
      <Text style={styles.intro}>{t('feedbackIntro')}</Text>

      {sent
        ?<View style={styles.done}>
          <Text style={styles.doneText} accessibilityLiveRegion="polite">{t('feedbackThanks')}</Text>
          <PrimaryButton label={t('close')} onPress={close}/>
        </View>
        :<>
          <View style={styles.kinds}>
            {KINDS.map(option=>
              <Pressable key={option.value} accessibilityRole="button" accessibilityState={{selected:kind===option.value}}
                onPress={()=>setKind(option.value)} style={[styles.kind,kind===option.value&&styles.kindActive]}>
                <Text style={[styles.kindText,kind===option.value&&{color:colors.surface}]}>{t(option.key)}</Text>
              </Pressable>)}
          </View>

          <Text style={styles.label}>{t('feedbackMessage')}</Text>
          <TextInput value={message} onChangeText={setMessage} multiline maxLength={4000}
            placeholder={t('feedbackMessageHint')} placeholderTextColor={colors.inkMuted}
            accessibilityLabel={t('feedbackMessage')} style={styles.input}/>

          <Text style={styles.label}>{t('feedbackEmail')}</Text>
          <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
            autoCorrect={false} maxLength={320} accessibilityLabel={t('feedbackEmail')} style={styles.line}/>
          <Text style={styles.hint}>{t('feedbackPrivacy')}</Text>

          {error.length>0&&<Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}
          <PrimaryButton label={busy?'…':t('feedbackSend')} disabled={busy} onPress={()=>void submit()}/>
          <PrimaryButton label={t('cancel')} kind="quiet" onPress={close}/>
        </>}
    </ScrollView>
  </Modal>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.canvas},
  pad:{padding:spacing.xl,paddingTop:spacing.huge,paddingBottom:spacing.huge},
  kicker:{fontFamily:fonts.semibold,fontSize:12,letterSpacing:1,textTransform:'uppercase',color:colors.clay},
  title:{fontFamily:fonts.bold,fontSize:30,lineHeight:34,color:colors.ink,letterSpacing:-1,marginTop:spacing.sm},
  intro:{fontFamily:fonts.body,fontSize:16,lineHeight:24,color:colors.inkMuted,marginTop:spacing.md},
  kinds:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,marginTop:spacing.xl},
  kind:{minHeight:44,paddingHorizontal:spacing.lg,justifyContent:'center',borderRadius:radius.pill,borderWidth:1,borderColor:colors.lineStrong},
  kindActive:{backgroundColor:colors.ink,borderColor:colors.ink},
  kindText:{fontFamily:fonts.medium,fontSize:15,color:colors.ink},
  label:{fontFamily:fonts.semibold,fontSize:12,letterSpacing:1,textTransform:'uppercase',color:colors.inkMuted,marginTop:spacing.xl,marginBottom:spacing.sm},
  input:{minHeight:160,textAlignVertical:'top',padding:spacing.md,borderWidth:1,borderColor:colors.lineStrong,borderRadius:radius.control,backgroundColor:colors.surface,fontFamily:fonts.body,fontSize:16,lineHeight:24,color:colors.ink},
  line:{minHeight:50,paddingHorizontal:spacing.md,borderWidth:1,borderColor:colors.lineStrong,borderRadius:radius.control,backgroundColor:colors.surface,fontFamily:fonts.body,fontSize:16,color:colors.ink},
  hint:{fontFamily:fonts.body,fontSize:14,lineHeight:21,color:colors.inkMuted,marginTop:spacing.sm},
  error:{fontFamily:fonts.medium,fontSize:14,color:colors.error,marginTop:spacing.md},
  done:{marginTop:spacing.xxl,gap:spacing.md,backgroundColor:colors.accentWash,borderRadius:radius.media,padding:spacing.lg},
  doneText:{fontFamily:fonts.semibold,fontSize:18,color:colors.ink},
});
