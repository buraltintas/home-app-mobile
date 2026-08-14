import React,{useEffect,useState} from 'react';
import {DefaultTheme,NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'expo-status-bar';
import {AccessibilityInfo,Easing} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {EditorialTabBar} from './src/components/EditorialTabBar';
import {AuthSheet} from './src/components/Primitives';
import {EmailAuth} from './src/screens/AuthScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {SearchScreen} from './src/screens/SearchScreen';
import {StoreScreen} from './src/screens/StoreScreen';
import {CreateScreen,FavoritesScreen,ProfileScreen} from './src/screens/SecondaryScreens';
import {I18nProvider,useI18n} from './src/i18n';
import {colors} from './src/theme/tokens';

type Tabs={Home:undefined;Search:undefined;Create:undefined;Favorites:undefined;Profile:undefined};
const Tab=createBottomTabNavigator<Tabs>();

function AppShell(){
  const {t}=useI18n();const [auth,setAuth]=useState(false);const [email,setEmail]=useState(false);const [store,setStore]=useState(false);const [reduceMotion,setReduceMotion]=useState(false);const openAuth=()=>setAuth(true);
  useEffect(()=>{AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);const subscription=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduceMotion);return()=>subscription.remove()},[]);
  if(store)return <SafeAreaView style={{flex:1,backgroundColor:colors.canvas}} edges={['top']}><StoreScreen onBack={()=>setStore(false)} onAuth={openAuth}/><AuthSheet visible={auth} onClose={()=>setAuth(false)} onEmail={()=>{setAuth(false);setEmail(true)}}/><EmailAuth visible={email} onClose={()=>setEmail(false)}/></SafeAreaView>;
  return <><SafeAreaView style={{flex:1,backgroundColor:colors.canvas}} edges={['top']}><NavigationContainer theme={{...DefaultTheme,colors:{...DefaultTheme.colors,background:colors.canvas,card:colors.surface,text:colors.ink,border:colors.line,primary:colors.accent}}}><Tab.Navigator tabBar={props=><EditorialTabBar {...props}/>} screenOptions={reduceMotion?{headerShown:false,animation:'none'}:{headerShown:false,transitionSpec:{animation:'timing',config:{duration:220,easing:Easing.out(Easing.cubic)}},sceneStyleInterpolator:({current})=>({sceneStyle:{opacity:current.progress.interpolate({inputRange:[-1,0,1],outputRange:[.42,1,.42]}),transform:[{translateX:current.progress.interpolate({inputRange:[-1,0,1],outputRange:[-18,0,18]})},{scale:current.progress.interpolate({inputRange:[-1,0,1],outputRange:[.988,1,.988]})}]}})}}><Tab.Screen name="Home" options={{title:t('home')}}>{()=><HomeScreen onAuth={openAuth} onStore={()=>setStore(true)}/>}</Tab.Screen><Tab.Screen name="Search" options={{title:t('search')}}>{()=><SearchScreen onOpen={()=>setStore(true)} onAuth={openAuth}/>}</Tab.Screen><Tab.Screen name="Create" options={{title:t('create')}}>{()=><CreateScreen onAuth={openAuth}/>}</Tab.Screen><Tab.Screen name="Favorites" options={{title:t('favorites')}}>{()=><FavoritesScreen onAuth={openAuth}/>}</Tab.Screen><Tab.Screen name="Profile" options={{title:t('profile')}}>{()=><ProfileScreen onAuth={openAuth}/>}</Tab.Screen></Tab.Navigator></NavigationContainer></SafeAreaView><AuthSheet visible={auth} onClose={()=>setAuth(false)} onEmail={()=>{setAuth(false);setEmail(true)}}/><EmailAuth visible={email} onClose={()=>setEmail(false)}/></>;
}

export default function App(){return <SafeAreaProvider><I18nProvider><StatusBar style="dark"/><AppShell/></I18nProvider></SafeAreaProvider>}
