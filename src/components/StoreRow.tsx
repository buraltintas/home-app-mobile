import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { mobilePlacePhotoSource } from '../api/client';
import type { Store } from '../api/types';
import { Icon } from './Icon';
import { Rating } from './Primitives';
import { useI18n } from '../i18n';
import { colors, fonts, radius, spacing } from '../theme/tokens';

// One store, as a row. Shared by favourites and the review flow's store picker so the two
// cannot describe the same store differently.
export function StoreRow({store,onPress,trailing}:{store:Store;onPress:()=>void;trailing?:React.ReactNode}) {
  const {t,locale}=useI18n();
  const google=store.external_sources?.find(source=>source.provider==='google');
  const photo=typeof google?.attribution?.photo_name==='string'?google.attribution.photo_name as string:undefined;
  const km=store.distance_meters===undefined?null:(store.distance_meters/1000).toLocaleString(locale,{maximumFractionDigits:1});
  return <Pressable onPress={onPress} accessibilityRole="button" style={({pressed})=>[styles.row,pressed&&{opacity:.7}]}>
    {photo
      ?<Image source={mobilePlacePhotoSource(photo,320)} style={styles.thumb} accessibilityLabel={store.name}/>
      :<View style={[styles.thumb,styles.thumbEmpty]}><Text style={styles.thumbMark}>{store.name.trim().slice(0,1)}</Text></View>}
    <View style={styles.body}>
      <Text numberOfLines={2} style={styles.name}>{store.name}</Text>
      <Text numberOfLines={1} style={styles.place}>{[store.district,store.city].filter(Boolean).join(', ')||store.address}</Text>
      {km&&<Text style={styles.distance}>{km} km</Text>}
      {store.platform.review_count>0
        ?<View style={styles.rating}><Rating value={store.platform.average_rating}/><Text style={styles.count}>{store.platform.review_count} {t('reviews')}</Text></View>
        :<Text style={styles.count}>{t('noCommunity')}</Text>}
    </View>
    {trailing??<Icon name="arrow" size={18} color={colors.inkMuted}/>}
  </Pressable>;
}

const styles=StyleSheet.create({
  row:{flexDirection:'row',alignItems:'center',gap:spacing.md,paddingVertical:spacing.lg,paddingHorizontal:spacing.lg,borderBottomWidth:1,borderBottomColor:colors.line},
  thumb:{width:76,height:76,borderRadius:radius.small+4,backgroundColor:colors.muted},
  thumbEmpty:{alignItems:'center',justifyContent:'center'},
  thumbMark:{fontFamily:fonts.bold,fontSize:28,color:colors.inkMuted},
  body:{flex:1,gap:2},
  name:{fontFamily:fonts.semibold,fontSize:18,lineHeight:23,color:colors.ink,letterSpacing:-.3},
  place:{fontFamily:fonts.body,fontSize:14,color:colors.inkMuted},
  distance:{fontFamily:fonts.medium,fontSize:13,color:colors.clay},
  rating:{flexDirection:'row',alignItems:'center',gap:spacing.sm,marginTop:2},
  count:{fontFamily:fonts.body,fontSize:13,color:colors.inkMuted},
});
