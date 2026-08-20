import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/tokens';
import { Icon } from './Icon';
import { useI18n } from '../i18n';

// Native Google sign-in needs an iOS and an Android OAuth client of its own; the web one
// cannot be reused. Until those exist the product offers passwordless email only.
const GOOGLE_READY=Boolean(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID??process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);

export function VerifiedBadge() { const {t}=useI18n(); return <View style={styles.verified}><Icon name="check" size={13} color={colors.success}/><Text style={styles.verifiedText}>{t('verified')}</Text></View>; }
export function Rating({value,size='normal'}:{value:number;size?:'normal'|'large'}) { return <View style={styles.rating}><Icon name="star" size={size==='large'?20:15} color={colors.clay}/><Text style={[styles.ratingText,size==='large'&&styles.ratingLarge]}>{value.toFixed(1)}</Text></View>; }
export function PrimaryButton({label,onPress,disabled=false,kind='primary'}:{label:string;onPress?:()=>void;disabled?:boolean;kind?:'primary'|'secondary'|'quiet'}) { return <Pressable accessibilityRole="button" accessibilityState={{disabled}} onPress={onPress} disabled={disabled} style={({pressed})=>[styles.button,kind==='secondary'&&styles.buttonSecondary,kind==='quiet'&&styles.buttonQuiet,disabled&&styles.disabled,pressed&&styles.pressed]}><Text style={[styles.buttonText,kind!=='primary'&&styles.buttonTextDark]}>{label}</Text></Pressable>; }
export function SearchField({value,onChange,onSubmit,placeholder}:{value:string;onChange:(v:string)=>void;onSubmit:()=>void;placeholder:string}) { return <View style={styles.search}><Icon name="search" size={22}/><TextInput value={value} onChangeText={onChange} onSubmitEditing={onSubmit} placeholder={placeholder} placeholderTextColor={colors.inkMuted} returnKeyType="search" accessibilityLabel={placeholder} style={styles.searchInput}/></View>; }

export function AuthSheet({visible,onClose,onEmail,onGoogle}:{visible:boolean;onClose:()=>void;onEmail:()=>void;onGoogle?:()=>void}) { const {t}=useI18n(); return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><Pressable style={styles.scrim} onPress={onClose}/><View style={styles.sheet} accessibilityViewIsModal><View style={styles.sheetHandle}/><Text style={styles.sheetTitle}>{t('signInTitle')}</Text><Text style={styles.sheetBody}>{t('signInBody')}</Text>{GOOGLE_READY&&<PrimaryButton label={t('google')} onPress={onGoogle}/>}<PrimaryButton label={t('email')} kind="secondary" onPress={onEmail}/><PrimaryButton label={t('later')} kind="quiet" onPress={onClose}/></View></Modal>; }

const styles=StyleSheet.create({
  verified:{flexDirection:'row',alignItems:'center',gap:5},verifiedText:{fontSize:12,lineHeight:16,color:colors.success,fontFamily:fonts.bold},
  rating:{flexDirection:'row',alignItems:'center',gap:4},ratingText:{fontSize:14,fontFamily:fonts.bold,color:colors.ink},ratingLarge:{fontSize:20},
  button:{minHeight:50,backgroundColor:colors.ink,borderRadius:radius.control,alignItems:'center',justifyContent:'center',paddingHorizontal:spacing.xl,marginTop:spacing.md},buttonSecondary:{backgroundColor:colors.accentWash,borderWidth:1,borderColor:colors.line},buttonQuiet:{backgroundColor:'transparent'},buttonText:{color:colors.white,fontSize:15,fontFamily:fonts.bold},buttonTextDark:{color:colors.ink},disabled:{opacity:.45},pressed:{opacity:.75},
  search:{flexDirection:'row',alignItems:'center',gap:spacing.md,minHeight:58,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.line,borderRadius:radius.control,paddingHorizontal:spacing.lg},searchInput:{flex:1,fontFamily:fonts.body,fontSize:16,color:colors.ink,paddingVertical:14},
  scrim:{...StyleSheet.absoluteFill,backgroundColor:'rgba(23,42,84,.42)'},sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:colors.canvas,borderTopWidth:1,borderTopColor:colors.accentWash,borderTopLeftRadius:radius.feature,borderTopRightRadius:radius.feature,padding:spacing.xxl,paddingBottom:40},sheetHandle:{width:42,height:4,borderRadius:2,backgroundColor:colors.line,alignSelf:'center',marginBottom:spacing.xxl},sheetTitle:{fontSize:27,lineHeight:35,fontFamily:fonts.bold,color:colors.ink,letterSpacing:-.8},sheetBody:{fontFamily:fonts.body,fontSize:16,lineHeight:24,color:colors.inkMuted,marginTop:spacing.sm,marginBottom:spacing.md},
});
