import type { Post, SearchResponse, StoreDetail } from '../api/types';

export const imagery = {
  feed: require('../../assets/bosagezme/store-living.jpg'),
  lighting: require('../../assets/bosagezme/store-lighting.jpg'),
  store: require('../../assets/bosagezme/store-detail.jpg'),
};

export const feedPost: Post = {
  id:'2d86fca1-e421-4da8-90f8-50facba529b0', user_id:'a4d07e79-792a-4625-aa89-bd41339deac7', store_id:'4ea6429b-81b8-4a64-a8cd-1d5b045bf3b2',
  text:'Avize seçenekleri genişti, çalışanlar da çok yardımcı oldu.', content_language:'tr', rating:5, visit_verified:true, distance_meters:84.7,
  created_at:'2026-08-12T16:42:18Z', username:'deniz.ev', display_name:'Deniz A.', avatar_url:'https://images.example.test/avatars/deniz.webp',
  store_name:'Luma Aydınlatma Kadıköy', store_city:'İstanbul', store_district:'Kadıköy', media:[{id:'dd3ad590-cd41-45e6-897f-a5db13ce5f5a',url:'/media/dd3ad590-cd41-45e6-897f-a5db13ce5f5a',mime_type:'image/webp',width:1440,height:1920}],
  like_count:18, comment_count:3, viewer_has_liked:false, viewer_follows_author:false, viewer_has_favorited_store:false,
};

export const searchFixture: SearchResponse = {
  search_id:'ca9f4ce3-f264-4b52-85f5-5f9469aa1249', visitor_session_id:'0ca7353b-f3eb-49b1-acbb-957744549fb4',
  intent:{scope:'home_living',query_language:'tr',normalized_query:"kadıköy'de modern avize mağazaları",store_name:'',location_text:'Kadikoy',categories:['lighting'],product_terms:['chandelier'],style_terms:['modern'],price_intent:'',attributes:[],sort_preference:'relevance',semantic_terms:['modern chandelier']},
  results:[
    {id:'4ea6429b-81b8-4a64-a8cd-1d5b045bf3b2',search_result_impression_id:'a4c79fc5-94ac-436c-b180-963e19bc28ca',source:'google+platform',name:'Luma Aydınlatma Kadıköy',address:'Caferağa Mah. Moda Cad. No: 42',city:'İstanbul',district:'Kadıköy',latitude:40.98781,longitude:29.02762,distance_meters:312.4,categories:['lighting'],platform:{store_id:'4ea6429b-81b8-4a64-a8cd-1d5b045bf3b2',average_rating:4.6,review_count:38,favorite_count:126,post_count:38},google:{provider:'google',place_id:'ChIJLumaKadikoyExample',rating:4.3,rating_count:214}},
    {search_result_impression_id:'6b8a69af-9b85-436b-973a-d6dabd668a98',source:'google',name:'Moda Işık Tasarım',address:'Osmanağa Mah. Söğütlü Çeşme Cad. No: 18, Kadıköy',latitude:40.99137,longitude:29.02584,distance_meters:528.1,categories:['lighting'],google:{provider:'google',place_id:'ChIJModaIsikExample',rating:4.7,rating_count:89}},
  ],
};

export const storeFixture: StoreDetail = {
  store:{id:'4ea6429b-81b8-4a64-a8cd-1d5b045bf3b2',name:'Luma Aydınlatma Kadıköy',slug:'luma-aydinlatma-kadikoy',brand_name:'Luma Aydınlatma',address:'Caferağa Mah. Moda Cad. No: 42',city:'İstanbul',district:'Kadıköy',latitude:40.98781,longitude:29.02762,distance_meters:312.4,categories:['lighting','decoration'],category_labels:['Aydınlatma','Dekorasyon'],localized_description:'Modern ve klasik ev aydınlatma ürünleri.',platform:{average_rating:4.6,rating_count:38,review_count:38,favorite_count:126,post_count:38},viewer_has_favorited:false,viewer_has_reviewed:false,external_sources:[{provider:'google',external_id:'ChIJLumaKadikoyExample',attribution:{name:'Google Maps'},refreshed_at:'2026-08-12T08:30:00Z'}]},
  recent_posts:[feedPost],
};
