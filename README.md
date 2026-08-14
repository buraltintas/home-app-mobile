# Home App Mobile

Home App’in iOS ve Android uygulaması. İnsanların fiziksel ev ve yaşam mağazalarını gerçek ziyaret fotoğrafları, puanlar ve topluluk deneyimleri üzerinden keşfetmesine odaklanan anonymous-first bir Expo/React Native deneyimidir.

Bu repository şu anda çalışan mobil frontend prototipini, typed API transport’unu ve Home App’e özgü native tasarım sistemini içerir.

## Mevcut deneyim

- Fotoğraf ve gerçek ziyaret odaklı Home Feed
- Doğal dil sorguları, son aramalar, kategoriler ve yakındaki mağazalar
- Home App topluluk verisi ile Google verisini ayrı sunan sonuçlar
- Mağaza detayı, galeri, topluluk deneyimleri ve temel aksiyonlar
- Ziyaret yorumu oluşturma adımları
- Favoriler, profil ve dil seçimi temelleri
- Google ve passwordless e-posta OTP auth sheet’leri
- Türkçe, İngilizce, Almanca ve Rusça arayüz
- iOS ve Android safe area’larına uyumlu özel alt navigasyon
- Location ve fotoğraf izinlerini yalnızca ihtiyaç anında isteyen akışlar

## Mobil tasarım ve hareket

Alt navigasyon stock tab bar değildir. Home App için özel olarak oluşturulmuştur:

- Label-free fakat screen-reader etiketli Home, Search, Create, Favorites ve Profile hedefleri
- Tutarlı Lucide outline ikonları ve her hedef için kontrollü renk kimliği
- Raised, bordersız terracotta Create düğmesi
- `expo-blur` ile gerçek platform materyali
- Sıcak translucent tint, yumuşak gölge ve hareket eden cam seçim lensi
- İçeriğin üzerinde yüzen katman; son içerik navigasyon altında kalmaz
- Sekme değişiminde 220 ms yön duyarlı cross-fade, en fazla 18 px yatay hareket ve hafif scale
- Reduce Motion etkinse scene ve navigasyon animasyonlarının kapanması

Cam materyal yalnızca navigasyonda kullanılır. Dekoratif parlama çizgileri veya içerik genelinde glassmorphism kullanılmaz.

## Teknoloji

- Expo SDK 57
- React Native 0.86
- React 19
- React Navigation 7
- TypeScript
- Expo Blur, SecureStore, Location ve Image Picker
- Lucide React Native + React Native SVG

## Kurulum

Gereksinimler:

- Node.js 20 veya güncel LTS
- Xcode Simulator veya Android Emulator
- Çalışan bir Home App API instance’ı

```bash
cp .env.example .env
npm install
npm start
```

Platform kısayolları:

```bash
npm run ios
npm run android
```

Fiziksel cihaz kullanırken `localhost` bilgisayarınızı değil cihazın kendisini gösterir. `EXPO_PUBLIC_API_ORIGIN` için LAN’dan erişilebilen bir adres kullanın.

### Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `EXPO_PUBLIC_API_ORIGIN` | Home App API origin’i |
| `EXPO_PUBLIC_MOBILE_BFF_SECRET` | Mevcut backend’in beklediği development client credential |

Mobile bundle içine derlenen her değer çıkarılabilir. `EXPO_PUBLIC_MOBILE_BFF_SECRET` kullanıcı kimlik doğrulaması değildir ve production güvenlik sınırı olarak kabul edilmemelidir.

## API ve kimlik doğrulama

Typed transport `src/api` altında izole edilmiştir. Access ve rotating refresh token’ları Expo SecureStore’da tutulur; anonim visitor ID auth state’inden ayrı saklanır.

Email auth passwordless OTP kullanır. Google auth backend audience’ına yönelik bir Google ID token bekler. Production öncesinde gerçek platform credential’ları ve redirect ayarları yapılandırılmalıdır.

## Fixture ve prototip davranışları

Canonical fixture şekilleri `home-app-api/docs/frontend-fixtures` kaynağından gelir. Bundled geliştirme görselleri presentation adapter’da tutulur ve production DTO’larını değiştirmez.

Mevcut ekranların bir bölümü prototip davranışı kullanır. Yerel beğeni/favori state’i gerçek backend başarısı anlamına gelmez. Production entegrasyonunda mutation başarılı olmadan kalıcı UI state’i gösterilmemeli veya optimistic update hata halinde geri alınmalıdır.

## İzin davranışı

- Konum izni uygulama açılışında istenmez.
- Yakındaki keşif ve ziyaret doğrulama bağlamında fayda açıklandıktan sonra istenir.
- Fotoğraf izni yalnızca yoruma medya eklerken istenir.

## Proje yapısı

```text
App.tsx            Navigation, auth sheets ve scene transitions
src/
  api/             Typed transport, token ve locale yönetimi
  components/      Cam tab bar, ikonlar, feed ve primitives
  data/            Canonical fixture ve presentation imagery
  i18n/            tr, en, de ve ru sözlükleri
  screens/         Feed, search, store, create, favorites ve profile
  theme/           Paylaşılan semantic token’lar
```

## Doğrulama

```bash
npm run typecheck
npm run lint
npm test
npx expo-doctor
```

## İlgili repository’ler

- API: [buraltintas/home-app-api](https://github.com/buraltintas/home-app-api)
- Web UI: [buraltintas/home-app-ui](https://github.com/buraltintas/home-app-ui)

