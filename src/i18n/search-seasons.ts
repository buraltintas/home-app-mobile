import type { Locale } from '../api/types';

// What people look for in a home store moves with the calendar. A balcony set is the most
// wanted thing in the country in May and an odd thing to suggest in January; an electric
// heater is the reverse. So the suggestion pool is seasonal, and large enough that nobody
// sees the same handful twice.
//
// This is the fallback. Where real searches exist nearby, those are shown instead -- these
// are what a quiet neighbourhood, or a brand new city, gets offered until it has its own.
export type Season='winter'|'spring'|'summer'|'autumn';

// Northern hemisphere, which is where the product operates. Worth revisiting the day it
// launches somewhere the seasons run the other way.
export function seasonFor(date=new Date()):Season{
  const month=date.getMonth();
  if(month<=1||month===11)return 'winter';
  if(month<=4)return 'spring';
  if(month<=7)return 'summer';
  return 'autumn';
}

type Pool={always:string[];winter:string[];spring:string[];summer:string[];autumn:string[]};

export const seasonalSearches:Record<Locale,Pool>={
  tr:{
    always:[
      'Oturma odam için yeni bir halı lazım','Yeni bir yemek takımı arıyorum','Yatak odası için sıcak bir gece lambası',
      'Uygun fiyatlı nevresim takımı nerede var','Küçük daireler için kompakt mobilya','El yapımı seramik ve vazo',
      'Salon için büyük bir ayna','Mutfak için düzenleyici kutular','Çalışma masası ve ergonomik sandalye',
      'Banyo için havlu ve bornoz','Kitaplık ve raf sistemleri','Modern avize ve sarkıt aydınlatma',
      'Çocuk odası için mobilya','Yer minderi ve puf','Bebek odası dekorasyonu','Kilim ve el dokuması halı',
      'Pencere için stor perde','Yatak odası gardırop çözümleri','Antre için ayakkabılık','Duvar için tablo ve poster',
      'Saksı ve iç mekan bitkisi','Kahve köşesi için ne alsam','Yemek masası ve sandalye takımı','Tekli koltuk ve berjer',
      'Mutfak tezgahı için küçük ev aletleri','Bulaşık makinesi ve ankastre','Sofra için cam bardak takımı',
      'Baharatlık ve saklama kabı','Aydınlatma için abajur','Kanepe için yıkanabilir kılıf','Balkon için katlanır masa',
      'Duvar kağıdı ve boya fikirleri','Ofis için dosya dolabı','Sehpa ve zigon takımı','Battaniye ve koltuk şalı',
      'Çerçeve ve fotoğraf duvarı',
    ],
    winter:[
      'Elektrikli ısıtıcı nereden alınır','Kalın kışlık nevresim ve yorgan','Polar battaniye ve pelüş şal',
      'Sıcak tutan kilim ve halı','Yılbaşı süsü ve ışık zinciri','Kışlık kalın perde',
      'Nemlendirici ve hava temizleyici','Çorba ve güveç için toprak kap','Kapı altı rüzgar önleyici',
      'Sıcak içecek için termos ve kupa','Şömine aksesuarı ve odunluk','Yatak için elektrikli battaniye',
      'Ev terliği ve kışlık ev kıyafeti','Mum ve kokulu mum',
    ],
    spring:[
      'Bahar temizliği için düzenleyiciler','Balkon için saksı ve çiçek','Açık renk yazlık nevresim',
      'İnce tül perde','Bahçe için budama ve el aleti','Balkon korkuluğuna asılan saksı',
      'Ev için hafif pastel dekorasyon','Piknik sepeti ve termos','Bahar için taze çiçek vazosu',
      'Kapı önü paspas ve giriş düzeni','Yağmurluk askısı ve şemsiyelik','Tohum ve saksı toprağı',
      'Dolap içi düzenleme kutuları','Kanepe için ince yazlık örtü',
    ],
    summer:[
      'Bahçe mobilyası ve oturma grubu','Balkon aydınlatması ve solar lamba','Şezlong ve güneş şemsiyesi',
      'Serinletici vantilatör ve klima','Balkon için sallanan koltuk','Hasır ve rattan mobilya',
      'Dış mekan için sentetik çim halı','Barbekü ve mangal takımı','Yazlık ince pike ve keten nevresim',
      'Sineklik ve cibinlik','Bahçe sulama ve hortum','Dış mekan minderi ve kılıfı',
      'Piknik ve kamp için katlanır sandalye','Soğutucu çanta ve buzluk',
    ],
    autumn:[
      'Sonbahar için sıcak tonlu tekstil','Koltuk için kalın şal ve battaniye','Okul için çocuk çalışma masası',
      'Kışa hazırlık saklama kabı','Turşu ve konserve için kavanoz','Ev için sıcak sarı aydınlatma',
      'Kalın kilim ve tüylü halı','Kitap köşesi için okuma lambası','Kapı önü çamurluk paspas',
      'Dolap düzenleyici ve vakumlu poşet','Çay ve kahve seti','Sonbahar dekorasyon fikirleri',
      'Yorgan ve nevresim değişimi','Ev için sıcak koku ve difüzör',
    ],
  },
  en:{
    always:[
      'I need a new rug for my living room','I am looking for a new dinner set','A warm bedside lamp for the bedroom',
      'Where can I find affordable bedding','Compact furniture for small flats','Handmade ceramics and vases',
      'A large mirror for the living room','Organiser boxes for the kitchen','A desk and an ergonomic chair',
      'Towels and bathrobes for the bathroom','Bookcases and shelving','Modern pendant lighting',
      'Furniture for a child’s room','Floor cushions and poufs','Nursery decoration','Kilims and handwoven rugs',
      'Roller blinds for the windows','Wardrobe solutions for the bedroom','A shoe rack for the hallway',
      'Prints and posters for the wall','Pots and indoor plants','Something for a coffee corner',
      'A dining table and chairs','An armchair for the corner','Small appliances for the kitchen counter',
      'A dishwasher and built-in appliances','Glassware for the table','Spice jars and storage containers',
      'A shade for the floor lamp','A washable sofa cover','A folding table for the balcony',
      'Wallpaper and paint ideas','A filing cabinet for the office','A coffee table and nesting tables',
      'Blankets and throws','Frames for a photo wall',
    ],
    winter:[
      'Where to buy an electric heater','A thick winter duvet','Fleece blankets and plush throws',
      'A warm rug for a cold floor','Festive lights and decorations','Heavy winter curtains',
      'A humidifier and air purifier','Earthenware for soups and stews','A draught excluder for the door',
      'Thermal mugs and flasks','Fireplace tools and a log basket','An electric blanket for the bed',
      'House slippers and loungewear','Candles and scented candles',
    ],
    spring:[
      'Organisers for a spring clean','Pots and flowers for the balcony','Light bedding in pale colours',
      'Sheer voile curtains','Pruning tools for the garden','Railing planters for the balcony',
      'Soft pastel decoration','A picnic basket and flask','A vase for fresh spring flowers',
      'A doormat and a tidy entrance','An umbrella stand and coat hooks','Seeds and potting soil',
      'Boxes for organising the wardrobe','A light summer throw for the sofa',
    ],
    summer:[
      'Garden furniture and seating','Balcony lighting and solar lamps','Sun loungers and parasols',
      'Fans and cooling units','A rocking chair for the balcony','Rattan and wicker furniture',
      'Artificial grass for outdoors','A barbecue and grill set','Light linen summer bedding',
      'Insect screens and mosquito nets','Garden watering and hoses','Outdoor cushions and covers',
      'Folding chairs for picnics and camping','A cool box and ice packs',
    ],
    autumn:[
      'Warm-toned textiles for autumn','Thick throws for the sofa','A child’s desk for the school year',
      'Storage boxes for putting summer away','Jars for preserves and pickles','Warm yellow lighting for the house',
      'A thick shaggy rug','A reading lamp for the book corner','A heavy-duty doormat',
      'Wardrobe organisers and vacuum bags','A tea and coffee set','Autumn decoration ideas',
      'Changing the duvet for a heavier one','A warm scent and a diffuser',
    ],
  },
  de:{
    always:[
      'Ich brauche einen neuen Teppich fürs Wohnzimmer','Ich suche ein neues Geschirrset','Eine warme Nachttischlampe',
      'Wo finde ich günstige Bettwäsche','Kompakte Möbel für kleine Wohnungen','Handgemachte Keramik und Vasen',
      'Ein großer Spiegel fürs Wohnzimmer','Ordnungsboxen für die Küche','Ein Schreibtisch und ein ergonomischer Stuhl',
      'Handtücher und Bademäntel','Bücherregale und Regalsysteme','Moderne Pendelleuchten',
      'Möbel fürs Kinderzimmer','Sitzkissen und Poufs','Deko fürs Babyzimmer','Kelims und handgewebte Teppiche',
      'Rollos für die Fenster','Kleiderschranklösungen fürs Schlafzimmer','Ein Schuhregal für den Flur',
      'Bilder und Poster für die Wand','Töpfe und Zimmerpflanzen','Etwas für die Kaffeeecke',
      'Ein Esstisch mit Stühlen','Ein Sessel für die Ecke','Kleingeräte für die Küchenzeile',
      'Eine Spülmaschine und Einbaugeräte','Gläser für den Tisch','Gewürzgläser und Vorratsdosen',
      'Ein Schirm für die Stehlampe','Ein waschbarer Sofabezug','Ein Klapptisch für den Balkon',
      'Tapeten- und Farbideen','Ein Aktenschrank fürs Büro','Ein Couchtisch und Beistelltische',
      'Decken und Plaids','Rahmen für eine Fotowand',
    ],
    winter:[
      'Wo kaufe ich einen Heizlüfter','Eine dicke Winterdecke','Fleecedecken und Kuscheldecken',
      'Ein warmer Teppich für kalte Böden','Lichterketten und Weihnachtsdeko','Schwere Wintervorhänge',
      'Ein Luftbefeuchter und Luftreiniger','Tontöpfe für Suppen und Eintöpfe','Ein Zugluftstopper für die Tür',
      'Thermobecher und Thermoskannen','Kaminbesteck und ein Holzkorb','Eine Heizdecke fürs Bett',
      'Hausschuhe und Hauskleidung','Kerzen und Duftkerzen',
    ],
    spring:[
      'Ordnungshelfer für den Frühjahrsputz','Töpfe und Blumen für den Balkon','Leichte Bettwäsche in hellen Farben',
      'Feine Voile-Gardinen','Gartenschere und Handwerkzeug','Balkonkästen für das Geländer',
      'Sanfte Pastelldeko','Ein Picknickkorb und eine Thermoskanne','Eine Vase für frische Frühlingsblumen',
      'Eine Fußmatte und ein aufgeräumter Eingang','Ein Schirmständer und Garderobenhaken','Samen und Blumenerde',
      'Boxen für den Kleiderschrank','Ein leichtes Sommerplaid fürs Sofa',
    ],
    summer:[
      'Gartenmöbel und Sitzgruppen','Balkonbeleuchtung und Solarlampen','Sonnenliegen und Sonnenschirme',
      'Ventilatoren und Klimageräte','Ein Schaukelstuhl für den Balkon','Rattan- und Korbmöbel',
      'Kunstrasen für draußen','Ein Grill und Grillbesteck','Leichte Leinenbettwäsche für den Sommer',
      'Fliegengitter und Moskitonetze','Gartenbewässerung und Schläuche','Outdoor-Kissen und Bezüge',
      'Klappstühle für Picknick und Camping','Eine Kühlbox und Kühlakkus',
    ],
    autumn:[
      'Textilien in warmen Herbsttönen','Dicke Plaids fürs Sofa','Ein Kinderschreibtisch für das Schuljahr',
      'Aufbewahrungsboxen für die Sommersachen','Gläser für Eingemachtes','Warmes gelbes Licht für die Wohnung',
      'Ein dicker Hochflorteppich','Eine Leselampe für die Leseecke','Eine robuste Schmutzfangmatte',
      'Schrankordner und Vakuumbeutel','Ein Tee- und Kaffeeservice','Herbstliche Dekoideen',
      'Die Bettdecke gegen eine wärmere tauschen','Ein warmer Duft und ein Diffusor',
    ],
  },
  ru:{
    always:[
      'Нужен новый ковёр в гостиную','Ищу новый обеденный сервиз','Тёплый ночник в спальню',
      'Где найти недорогое постельное бельё','Компактная мебель для маленькой квартиры','Керамика и вазы ручной работы',
      'Большое зеркало в гостиную','Органайзеры для кухни','Письменный стол и эргономичное кресло',
      'Полотенца и халаты в ванную','Книжные шкафы и стеллажи','Современные подвесные светильники',
      'Мебель в детскую','Напольные подушки и пуфы','Декор для детской','Килимы и ковры ручной работы',
      'Рулонные шторы на окна','Гардеробные решения для спальни','Обувница в прихожую',
      'Постеры и картины на стену','Горшки и комнатные растения','Что-нибудь для кофейного уголка',
      'Обеденный стол и стулья','Кресло в угол комнаты','Мелкая техника для кухни',
      'Посудомоечная машина и встраиваемая техника','Стеклянные бокалы на стол','Банки для специй и хранения',
      'Абажур для торшера','Съёмный чехол на диван','Складной столик на балкон',
      'Идеи обоев и краски','Шкаф для документов в офис','Журнальный стол и столики',
      'Пледы и покрывала','Рамки для фотостены',
    ],
    winter:[
      'Где купить обогреватель','Тёплое зимнее одеяло','Флисовые пледы и мягкие покрывала',
      'Тёплый ковёр на холодный пол','Гирлянды и новогодние украшения','Плотные зимние шторы',
      'Увлажнитель и очиститель воздуха','Керамика для супов и рагу','Уплотнитель от сквозняка',
      'Термокружки и термосы','Каминный набор и дровница','Электрическое одеяло',
      'Домашние тапочки и одежда для дома','Свечи и ароматические свечи',
    ],
    spring:[
      'Органайзеры для весенней уборки','Горшки и цветы на балкон','Лёгкое постельное бельё светлых тонов',
      'Тонкий тюль','Садовый секатор и инструменты','Балконные ящики на перила',
      'Мягкий пастельный декор','Корзина для пикника и термос','Ваза для свежих весенних цветов',
      'Коврик у двери и порядок в прихожей','Подставка для зонтов и крючки','Семена и грунт для рассады',
      'Коробки для порядка в шкафу','Лёгкий летний плед на диван',
    ],
    summer:[
      'Садовая мебель и уличные диваны','Освещение балкона и солнечные лампы','Шезлонги и зонты от солнца',
      'Вентиляторы и кондиционеры','Кресло-качалка на балкон','Ротанговая и плетёная мебель',
      'Искусственный газон для улицы','Мангал и набор для гриля','Лёгкое льняное постельное бельё',
      'Москитные сетки и пологи','Полив сада и шланги','Уличные подушки и чехлы',
      'Складные стулья для пикника и кемпинга','Сумка-холодильник и аккумуляторы холода',
    ],
    autumn:[
      'Текстиль в тёплых осенних тонах','Плотные пледы на диван','Детский письменный стол к школе',
      'Коробки, чтобы убрать летние вещи','Банки для заготовок и солений','Тёплый жёлтый свет в доме',
      'Плотный ковёр с высоким ворсом','Лампа для чтения в уголок','Прочный придверный коврик',
      'Органайзеры и вакуумные пакеты для шкафа','Чайный и кофейный сервиз','Идеи осеннего декора',
      'Поменять одеяло на более тёплое','Тёплый аромат и диффузор',
    ],
  },
};

// The pool a visitor can be shown right now: everything evergreen, plus the season we are
// actually in. Around fifty phrases, which is enough that two visits in a row do not
// repeat.
export function seasonalPool(locale:Locale,date=new Date()):string[]{
  const pool=seasonalSearches[locale];
  return [...pool.always,...pool[seasonFor(date)]];
}
