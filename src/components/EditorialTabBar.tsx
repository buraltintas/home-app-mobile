import React,{useEffect,useRef,useState} from 'react';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {BlurView} from 'expo-blur';
import {AccessibilityInfo,Animated,Pressable,StyleSheet,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from './Icon';
import {colors,spacing} from '../theme/tokens';

type ItemProps={name:string;label:string;focused:boolean;isCreate:boolean;onPress:()=>void};
const tabColors:Record<string,string>={home:colors.clay,search:colors.accentWash,favorites:'#D94B77',profile:'#2C7770'};
function TabItem({name,label,focused,isCreate,onPress}:ItemProps){
  const focus=useRef(new Animated.Value(focused?1:0)).current;const press=useRef(new Animated.Value(1)).current;
  useEffect(()=>{AccessibilityInfo.isReduceMotionEnabled().then(reduced=>reduced?focus.setValue(focused?1:0):Animated.spring(focus,{toValue:focused?1:0,useNativeDriver:true,damping:16,stiffness:190,mass:.75}).start())},[focus,focused]);
  const pressIn=()=>Animated.spring(press,{toValue:.88,useNativeDriver:true,damping:18,stiffness:360}).start();
  const pressOut=()=>Animated.spring(press,{toValue:1,useNativeDriver:true,damping:12,stiffness:260}).start();
  return <Pressable accessibilityRole="tab" accessibilityState={{selected:focused}} accessibilityLabel={label} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={styles.item}><Animated.View style={[styles.itemInner,{opacity:focus.interpolate({inputRange:[0,1],outputRange:[.68,1]}),transform:[{translateY:focus.interpolate({inputRange:[0,1],outputRange:[0,isCreate?-4:-2]})},{scale:Animated.multiply(press,focus.interpolate({inputRange:[0,1],outputRange:[1,isCreate?1.06:1.09]}))}]}]}>{isCreate?<View style={[styles.createOrb,focused&&styles.createOrbActive]}><Icon name={name} size={25} color={colors.surface}/></View>:<Icon name={name} size={24} color={tabColors[name]??colors.inkMuted}/>}</Animated.View></Pressable>;
}

export function EditorialTabBar({state,descriptors,navigation}:BottomTabBarProps){
  const insets=useSafeAreaInsets();const [width,setWidth]=useState(0);const progress=useRef(new Animated.Value(state.index)).current;
  useEffect(()=>{AccessibilityInfo.isReduceMotionEnabled().then(reduced=>reduced?progress.setValue(state.index):Animated.spring(progress,{toValue:state.index,useNativeDriver:true,damping:19,stiffness:180,mass:.8}).start())},[progress,state.index]);
  const slot=width>0?width/state.routes.length:0;const translateX=progress.interpolate({inputRange:state.routes.map((_,i)=>i),outputRange:state.routes.map((_,i)=>i*slot+(slot-44)/2)});const indicatorOpacity=progress.interpolate({inputRange:state.routes.map((_,i)=>i),outputRange:state.routes.map((_,i)=>i===2?0:1),extrapolate:'clamp'});
  return (
    <View style={[styles.zone,{height:70+insets.bottom,paddingBottom:Math.max(insets.bottom,8)}]}>
      <View style={styles.rail} onLayout={e=>setWidth(e.nativeEvent.layout.width)}>
        <View pointerEvents="none" style={styles.glassClip}>
          <BlurView tint="systemUltraThinMaterialLight" intensity={56} blurMethod="dimezisBlurView" style={StyleSheet.absoluteFill}/>
          <View style={styles.glassTint}/>
        </View>
        {width>0&&<Animated.View pointerEvents="none" style={[styles.indicator,{opacity:indicatorOpacity,transform:[{translateX}]}]}/>}
        {state.routes.map((route,index)=>{const focused=state.index===index;const label=String(descriptors[route.key].options.title??route.name);const onPress=()=>{const event=navigation.emit({type:'tabPress',target:route.key,canPreventDefault:true});if(!focused&&!event.defaultPrevented)navigation.navigate(route.name,route.params)};return <TabItem key={route.key} name={route.name.toLowerCase()} label={label} focused={focused} isCreate={route.name==='Create'} onPress={onPress}/>})}
      </View>
    </View>
  );
}

const styles=StyleSheet.create({zone:{position:'absolute',left:0,right:0,bottom:0,zIndex:100,elevation:100,backgroundColor:'transparent',justifyContent:'flex-start'},rail:{height:62,marginHorizontal:spacing.lg,marginTop:2,zIndex:101,backgroundColor:'rgba(255,249,238,.08)',borderWidth:1,borderColor:'rgba(255,255,255,.68)',borderRadius:22,paddingHorizontal:0,flexDirection:'row',alignItems:'center',shadowColor:colors.ink,shadowOffset:{width:0,height:12},shadowOpacity:.18,shadowRadius:26,elevation:101,overflow:'visible'},glassClip:{position:'absolute',top:0,right:0,bottom:0,left:0,borderRadius:22,overflow:'hidden'},glassTint:{position:'absolute',top:0,right:0,bottom:0,left:0,backgroundColor:'rgba(255,249,238,.26)'},indicator:{position:'absolute',left:0,top:8,width:44,height:44,borderRadius:14,backgroundColor:colors.accentWash,borderWidth:0,shadowColor:colors.ink,shadowOffset:{width:3,height:4},shadowOpacity:.2,shadowRadius:6,elevation:2},item:{flex:1,height:60,alignItems:'center',justifyContent:'center',zIndex:102,elevation:102},itemInner:{alignItems:'center',justifyContent:'center'},createOrb:{width:50,height:50,borderRadius:17,zIndex:103,elevation:103,backgroundColor:colors.clay,alignItems:'center',justifyContent:'center',shadowColor:colors.clay,shadowOffset:{width:0,height:7},shadowOpacity:.32,shadowRadius:12,overflow:'hidden'},createOrbActive:{backgroundColor:colors.clay,shadowOpacity:.38,shadowRadius:15}});
