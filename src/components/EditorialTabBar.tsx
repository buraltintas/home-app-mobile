import React,{useEffect,useMemo,useRef,useState} from 'react';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {BlurView} from 'expo-blur';
import {AccessibilityInfo,Animated,Pressable,StyleSheet,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from './Icon';
import {colors,radius,spacing} from '../theme/tokens';

// The rail is one floating material surface: real blur, a warm translucent tint, a quiet
// edge and a single soft shadow. Depth comes from the material, not from drawn highlights.
//
// A lens travels between destinations and fades out behind the Create orb, which sits above
// the rail as one uninterrupted accent surface. The lens position is measured from the tabs
// themselves rather than assumed from an equal division: the orb is wider than its
// neighbours, so a calculated slot put the lens under the wrong icon.

// Each destination keeps its own restrained colour so the rail reads at a glance. All of
// them have to be legible on a near-white material -- the previous search colour was a
// honey wash, which is nearly the colour of the rail itself and disappeared into it.
const tabColors:Record<string,string>={
  home:colors.clay,
  search:colors.accentInk,
  favorites:'#B8446B',
  profile:'#2C7770',
};

type ItemProps={
  name:string;label:string;focused:boolean;isCreate:boolean;reduceMotion:boolean;
  onPress:()=>void;onLayout:(x:number,width:number)=>void;
};

function TabItem({name,label,focused,isCreate,reduceMotion,onPress,onLayout}:ItemProps){
  const focus=useRef(new Animated.Value(focused?1:0)).current;
  const press=useRef(new Animated.Value(1)).current;

  useEffect(()=>{
    if(reduceMotion){focus.setValue(focused?1:0);return;}
    Animated.spring(focus,{toValue:focused?1:0,useNativeDriver:true,damping:15,stiffness:200,mass:.7}).start();
  },[focus,focused,reduceMotion]);

  const to=(value:number)=>{
    if(reduceMotion){press.setValue(1);return;}
    Animated.spring(press,{toValue:value,useNativeDriver:true,damping:17,stiffness:340}).start();
  };

  const tint=tabColors[name]??colors.inkMuted;
  return <Pressable
    accessibilityRole="tab"
    accessibilityState={{selected:focused}}
    accessibilityLabel={label}
    onPress={onPress}
    onPressIn={()=>to(.9)}
    onPressOut={()=>to(1)}
    onLayout={event=>onLayout(event.nativeEvent.layout.x,event.nativeEvent.layout.width)}
    style={[styles.item,isCreate&&styles.itemCreate]}>
    <Animated.View style={{
      transform:[
        {translateY:focus.interpolate({inputRange:[0,1],outputRange:[0,isCreate?-3:-2]})},
        {scale:Animated.multiply(press,focus.interpolate({inputRange:[0,1],outputRange:[1,isCreate?1.04:1.07]}))},
      ],
      opacity:isCreate?1:focus.interpolate({inputRange:[0,1],outputRange:[.62,1]}),
    }}>
      {isCreate
        ?<View style={styles.orb}><Icon name={name} size={26} color={colors.surface}/></View>
        :<Icon name={name} size={24} color={tint}/>}
    </Animated.View>
  </Pressable>;
}

export function EditorialTabBar({state,descriptors,navigation}:BottomTabBarProps){
  const insets=useSafeAreaInsets();
  const [slots,setSlots]=useState<{x:number;width:number}[]>([]);
  const [reduceMotion,setReduceMotion]=useState(false);
  const progress=useRef(new Animated.Value(state.index)).current;

  useEffect(()=>{
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduceMotion);
    return()=>subscription.remove();
  },[]);

  useEffect(()=>{
    if(reduceMotion){progress.setValue(state.index);return;}
    Animated.spring(progress,{toValue:state.index,useNativeDriver:true,damping:18,stiffness:170,mass:.8}).start();
  },[progress,state.index,reduceMotion]);

  const measured=slots.length===state.routes.length&&slots.every(Boolean);
  const createIndex=state.routes.findIndex(route=>route.name==='Create');
  const inputRange=state.routes.map((_,index)=>index);

  const lens=useMemo(()=>{
    if(!measured)return null;
    return {
      translateX:progress.interpolate({inputRange,outputRange:slots.map(slot=>slot.x+(slot.width-LENS)/2)}),
      opacity:progress.interpolate({inputRange,outputRange:inputRange.map(index=>index===createIndex?0:1),extrapolate:'clamp'}),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[measured,slots,progress,createIndex]);

  return <View style={[styles.zone,{paddingBottom:Math.max(insets.bottom,10)}]}>
    <View style={styles.rail}>
      <View pointerEvents="none" style={styles.material}>
        <BlurView tint="systemUltraThinMaterialLight" intensity={62} blurMethod="dimezisBlurView" style={StyleSheet.absoluteFill}/>
        <View style={styles.tint}/>
      </View>
      {lens&&<Animated.View pointerEvents="none" style={[styles.lens,{opacity:lens.opacity,transform:[{translateX:lens.translateX}]}]}/>}
      {state.routes.map((route,index)=>{
        const focused=state.index===index;
        const label=String(descriptors[route.key].options.title??route.name);
        const onPress=()=>{
          const event=navigation.emit({type:'tabPress',target:route.key,canPreventDefault:true});
          if(!focused&&!event.defaultPrevented)navigation.navigate(route.name,route.params);
        };
        return <TabItem
          key={route.key}
          name={route.name.toLowerCase()}
          label={label}
          focused={focused}
          isCreate={route.name==='Create'}
          reduceMotion={reduceMotion}
          onPress={onPress}
          onLayout={(x,width)=>setSlots(current=>{
            const next=[...current];next[index]={x,width};return next;
          })}/>;
      })}
    </View>
  </View>;
}

const LENS=46;
const styles=StyleSheet.create({
  zone:{position:'absolute',left:0,right:0,bottom:0,zIndex:100,elevation:100},
  rail:{
    height:64,marginHorizontal:spacing.lg,flexDirection:'row',alignItems:'center',
    borderRadius:24,borderWidth:StyleSheet.hairlineWidth,borderColor:'rgba(22,20,15,.10)',
    shadowColor:colors.ink,shadowOffset:{width:0,height:10},shadowOpacity:.14,shadowRadius:24,elevation:12,
  },
  material:{position:'absolute',top:0,right:0,bottom:0,left:0,borderRadius:24,overflow:'hidden'},
  tint:{position:'absolute',top:0,right:0,bottom:0,left:0,backgroundColor:'rgba(255,255,255,.55)'},
  lens:{position:'absolute',left:0,width:LENS,height:LENS,borderRadius:radius.small+4,backgroundColor:colors.accentWash},
  item:{flex:1,height:64,alignItems:'center',justifyContent:'center'},
  itemCreate:{flex:1.15},
  orb:{
    width:52,height:52,borderRadius:18,backgroundColor:colors.clay,alignItems:'center',justifyContent:'center',
    shadowColor:colors.clay,shadowOffset:{width:0,height:6},shadowOpacity:.30,shadowRadius:12,elevation:8,
  },
});
