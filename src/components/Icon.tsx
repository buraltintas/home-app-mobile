import React from 'react';
import {Bookmark,Check,ChevronLeft,Heart,Home,Image as ImageIcon,LucideIcon,MapPin,MessageCircle,Navigation,Plus,Search,Settings,Share2,Star,UserRound,X} from 'lucide-react-native';
import {colors} from '../theme/tokens';

const icons:Record<string,LucideIcon>={home:Home,search:Search,create:Plus,favorites:Heart,profile:UserRound,heart:Heart,comment:MessageCircle,share:Share2,bookmark:Bookmark,directions:Navigation,check:Check,back:ChevronLeft,close:X,pin:MapPin,star:Star,photo:ImageIcon,settings:Settings};
export function Icon({name,size=20,color=colors.ink}:{name:string;size?:number;color?:string}){const Glyph=icons[name]??Home;return <Glyph accessibilityElementsHidden size={size} color={color} strokeWidth={1.85} fill={name==='star'?color:'none'}/>}

