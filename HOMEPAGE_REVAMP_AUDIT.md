# Audit bản design homepage Sneaker Head mới nhất

**Ngày audit:** 09-09-2026; cập nhật theo handoff vòng 2–3 ngày 10-09-2026 và bản ship vòng 4 ngày 14-09-2026  
**Design được audit:** `Sneaker Head product page design.zip`, `/Users/thuando/Downloads/handoff 2/`, `/Users/thuando/Downloads/handoff 3/`, bản ship `/Users/thuando/Downloads/handoff 4/` và “Patch sau Handoff 4” do designer gửi ngày 14-09-2026  
**Branch:** `work/machine-b-homepage-revamp-audit`  
**Baseline repository:** `4404f75` — `feat: complete Foot Locker catalog cutover`  
**Trạng thái:** Chỉ audit design và contract tích hợp. Chưa sửa giao diện, chưa upload hoặc publish theme.

## 1. Phạm vi và thứ tự nguồn chuẩn

Các câu hướng dẫn nằm trong bộ design được xem là ghi chú của designer, không tự động ghi đè yêu cầu của dự án.

Khi có mâu thuẫn, áp dụng thứ tự:

1. `PROJECT_HANDOFF.md` và `TWO_MACHINE_WORKFLOW.md`.
2. Quyết định được anh duyệt trực tiếp.
3. Design contract đã được anh và designer chốt sau audit.
4. `Design Material.dc.html`.
5. Tài liệu component riêng.
6. Prototype full-page và demo code.

Phần tạo/import collection và product do dev/agent khác phụ trách. Audit này không đánh giá người làm hoặc quy trình import. Em chỉ xác định **interface dữ liệu homepage cần nhận** để theme kết nối đúng.

### Cách đọc người chịu trách nhiệm trả lời

Mỗi câu hỏi chưa chốt trong audit được gắn một trong ba nhãn:

- **Hỏi chính: Claude** — Claude chịu trách nhiệm chính về design FE, responsive, motion, glass/effect và tính nhất quán của prototype/spec. Claude cần đưa ra **một phương án canonical có số đo hoặc reference code rõ ràng**. Anh không cần quyết thay Claude các chi tiết implementation thuần kỹ thuật.
- **Hỏi chính: Anh** — đây là quyết định của store owner về scope, business rule, merchandising hoặc trải nghiệm mua hàng. Claude và em có thể khuyến nghị, nhưng không tự quyết thay anh.
- **Hỏi chung: Anh + Claude** — Claude phải đề xuất phương án visual/interaction khả thi trước; anh duyệt trải nghiệm và trade-off cuối cùng. Em sẽ kiểm tra tính tương thích với Dawn/Shopify và chuyển quyết định đã duyệt thành implementation contract.

`Hỏi chính` không có nghĩa người còn lại không được góp ý. Nó xác định ai phải đưa câu trả lời đầu tiên và ai là người có quyền chốt cuối cùng, để tránh vòng trao đổi không có owner.

## 2. Kết luận nhanh

Bản 09-09 tốt hơn bản trước rất nhiều và đã gần mức có thể triển khai:

- Có handoff README rõ ràng.
- Breakpoint production được chốt còn `768` và `1280`.
- Có 7 artboard từ 390 đến 3840.
- Asset demo và asset production được phân loại.
- Có spec riêng cho Button, Product Card, Tab Track, Panel, CTL Card và LookBanner.
- Có Collection Sheet và CSV để mô tả nguồn dữ liệu.
- Responsive trung gian, touch, sticky stack và rail đã được mô tả chi tiết hơn.
- Bản gốc từng chốt 12 product card mỗi rail; con số này đã được bản ship handoff 4 thay bằng contract 21/15/15 ở các rail chính.

Ở vòng audit đầu, bản này **chưa nên đưa thẳng vào theme** vì các điểm P0 sau:

1. Hai hệ thông số liquid-glass đang mâu thuẫn trực tiếp.
2. Product Card prototype vẫn bọc toàn card bằng link, trái rule đã duyệt.
3. Panel host có hai cách triển khai loại trừ nhau trong cùng tài liệu.
4. Một số con số trong Design Material và component vẫn lệch nhau.
5. Chưa chốt rõ phạm vi revamp header/panel/mega menu toàn site.
6. Complete the Look vẫn chưa chốt logic mua từng món hay bundle thật.
7. Collector's Pick chưa thống nhất là banner collection hay product rail.

Handoff 2 đã trả lời toàn bộ `Q-C` và đưa đề xuất cho `Q-J`, nhưng phần trả lời và file thật vẫn mâu thuẫn ở lens và product-rail sizing. Handoff 3 đã sửa đúng semantic contract Product Card nhưng rail vẫn còn hai composition khác nhau. Ngày 10-09-2026, anh đã trực tiếp xác nhận các quyết định owner, trong đó `SHOP LOOK` là bundle thật và phần trăm giảm phải chỉnh được về sau trong Shopify Admin.

Handoff 4 ngày 14-09 đã **khóa khác biệt visual cuối cùng** bằng code render thật: rail có peek, gap 12px, số cột cố định theo nhóm thiết bị; native scroll snap theo card còn nút/dot đi theo trang. Em đã mở bản design, đo trực tiếp các frame 390/768/1280/1440/1920 và kiểm tra console. Không còn blocker phải gửi Claude trước khi chuyển sang implementation contract.

### 2.1 Kết quả xác minh handoff 2

| Nhóm | Kết quả |
|---|---|
| `Q-C01` Lens | **Chưa đạt.** Claude chọn `objectBoundingBox` + phân số, nhưng CTL Card/Button/Design Material vẫn chứa bảng và câu cũ gọi cùng hệ là px tuyệt đối hoặc cấm chính `objectBoundingBox`. |
| `Q-C02` Product Card | **Đã rõ direction, chưa sạch source.** Answer tách đúng bốn vùng tương tác; component/full-page vẫn là full-card `<a>` + Quick Add `<span>` vì là demo. Cần ghi nhãn rõ “visual demo only” và đưa semantic production contract vào source canonical. |
| `Q-C03` Panel host | **Đạt về quyết định.** Production dùng `position:fixed; inset:0`; sticky/margin âm chỉ dành cho artboard demo. Cần giữ ranh giới này rõ khi port sang Dawn. |
| `Q-C04` Canonical numbers | **Chưa đạt hoàn toàn.** Nhiều số đã được giải thích, nhưng Tab mobile vẫn còn cả 10px và 11px; rail width còn lệch với `Q-C05`. |
| `Q-C05` Rail peek | **Chưa đạt.** Answer nói fixed px và đã xoá công thức cũ; Design Material/full-page vẫn dùng `30.5cqw`, desktop `1fr` và mobile `calc((100% - 12px)/2)`. Bảng peek trong Answer cũng không khớp hình học gutter/card/gap. |
| `Q-C06` Visual states | **Đạt ở mức contract.** State được mô tả đủ để triển khai; chưa coi demo hiện tại là accessibility implementation. Semantic vẫn do theme production chịu trách nhiệm. |
| `Q-J01/J02/J04` | **Anh đã xác nhận trực tiếp:** giữ CTL 74/24; giữ sticky choreography; Collector's Pick là collection-banner carousel. |
| `Q-J03` Glass | Anh chọn full effect trên mọi máy. Cần khóa cách hiểu: không auto-downgrade theo cấu hình/FPS, nhưng vẫn fallback khi browser không hỗ trợ hoặc người dùng bật reduced-motion/reduced-transparency. |
| `Q-J05` Hero asset | **Anh đã chốt:** hai image setting tùy chọn; thiếu mobile image thì fallback về desktop master + focal point. |

**Kết luận vòng 2:** chưa bắt đầu implementation. Claude cần phát hành một bản sửa nhỏ xử lý `Q-C01`, `Q-C04`, `Q-C05` và gắn rõ ranh giới demo/production của `Q-C02`. Phía owner còn khóa discount/availability của bundle và diễn giải `Q-J03`.

### 2.2 Kết quả xác minh handoff 3

Em đã đọc toàn bộ `ANSWER - Design FE audit v2.md`, `CHANGELOG - audit fixes.md`, screenshot README; đối chiếu các component, Design Material, full homepage, mobile/tablet full-page và xem toàn bộ 5 screenshot.

| Nhóm | Kết quả vòng 3 |
|---|---|
| `Q-C01` Lens | **Em tự xử lý khi code.** Filter declaration và Answer đã đủ để khóa hệ `objectBoundingBox` + phân số canonical. Câu “pixel tuyệt đối” trong Button là stale documentation; em không port câu đó và tự QA Chrome/Safari + fallback. Không cần Claude sửa lại chỉ để sạch tài liệu. |
| `Q-C02` Product Card | **Đã đóng.** Component đã gắn cảnh báo `VISUAL DEMO ONLY — DO NOT PORT THIS MARKUP TO SHOPIFY` và có riêng mục `Production structure — CANONICAL` với wrapper không phải link, link media/title, swatch button và Dawn native Quick Add. |
| `Q-C04` Canonical numbers | **Em tự xử lý khi code.** Answer đã khóa `11px/.06em`; các occurrence `10px/.05em` trong prototype là stale. Em dùng canonical token và tự regression-test toàn homepage. |
| `Q-C05` Rail | **Điểm duy nhất cần Claude xác nhận.** Answer chọn page model gap 12px và `peek=0`, nhưng full-page preview vẫn dùng `30.5cqw`/gap 16px. Hai cách cho composition nhìn khác rõ tại tablet; tự chọn có nguy cơ lệch preview và gây rework. Chỉ cần Claude xác nhận một trong hai là canonical, không cần làm lại bộ screenshot ở stage này. |

**Kết luận vòng 3 theo nguyên tắc owner mới:** em tự hấp thụ `Q-C01` và `Q-C04` vào implementation contract, tự render/QA browser và không yêu cầu Claude sửa tài liệu. `Q-C02/Q-C03/Q-C06` đã đóng. Chỉ raise `Q-C05` vì nó là khác biệt composition nhìn thấy rõ giữa page model no-peek và preview rail hiện tại.

### 2.3 Kết quả xác minh bản ship handoff 4

Em đã đọc toàn bộ `HANDOFF README.txt`, `ANSWER - Design FE audit v2.md`, `CHANGELOG - audit fixes.md` và screenshot README; đối chiếu Design Material, component, demo, source homepage và mở bản design trong browser.

| Nhóm | Kết quả vòng 4 |
|---|---|
| `Q-C01` Lens | **Đã đủ để triển khai.** Canonical là bốn filter `objectBoundingBox` với scale dạng phân số. Một số câu giải thích cũ trong component/Design Material còn mâu thuẫn, nhưng filter declaration và source render đã rõ; em bỏ qua documentation stale và tự QA browser/fallback. |
| `Q-C02` Product Card | **Đã đóng.** Production vẫn giữ cấu trúc Dawn: article wrapper, media/title link riêng, swatch button và native Quick Add. Không port full-card anchor của visual demo. |
| `Q-C04` Canonical numbers | **Đã đủ để triển khai.** Source ship không còn occurrence rail `30.5cqw` hoặc tab `10px/.05em` bị nêu ở vòng trước. Shared token production vẫn dùng tab `11px/.06em`. |
| `Q-C05` Rail | **Đã đóng bằng source render thật.** Peek không bằng 0; gap 12px. Desktop: Hot Deals 6 cột, product rail 5 cột, page width `rail − 84`; tablet 3 cột; mobile 2 cột, page/card-flow `rail − 12`. Native wheel/trackpad snap theo card; nút và dot desktop đi theo trang; touch không có nút/dot. |
| Render/asset | **Pass vòng audit.** Bảy frame render được, không có console error/warning. Local design runtime có request bootstrap tạm tới placeholder/state file chưa tồn tại, nhưng nội dung sau render vẫn hoạt động; không port cơ chế này vào theme. Asset production vẫn chỉ gồm 9 brand SVG; product/editorial image demo không được port vào theme. |

Số đo source đã xác minh: product card desktop `210/242/338px` tại `1280/1440/1920`; Hot Deals `173/200/280px`; tablet 768 là `228px`; mobile 390 là `167px`. Page desktop tương ứng `1100/1260/1740px`, để lộ sliver 72px trong content box. Mobile/tablet dùng full-bleed + gutter 16/24px nên vẫn nhìn thấy đầu card kế tiếp.

Một số đoạn tài liệu lịch sử vẫn chưa được dọn: Answer còn công thức dynamic `N_PREFERRED/cardMin`, Design Material §8.8 còn tổng 12 card, và README còn một câu gọi desktop snap theo page. Vì README cũng chỉ rõ **code đang render là chuẩn**, em lấy source ship làm canonical: Hot Deals 21 mục ở desktop/tablet (`1 Top Deal + 20 card`, mobile bỏ Top Deal còn 20), Trending 15, Accessories 15; scroll snap nằm trên card, còn button/dot dùng page destinations. Đây là lỗi tài liệu em tự hấp thụ, không cần thêm vòng hỏi Claude.

### 2.4 Patch sau handoff 4 — long text và intrinsic grid sizing

Designer bổ sung hai correction CSS, không đổi cấu trúc, số cột, composition hoặc JavaScript. Em nhận đây là phần nối tiếp của source ship handoff 4 và đưa thẳng vào implementation contract:

1. Dòng metadata “thương hiệu · loại” trên Product Card luôn một dòng: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`.
2. Mọi track lưới của rail dùng `repeat(N, minmax(0, 1fr))`, không dùng `repeat(N, 1fr)`.
3. Phần tử/card link trực tiếp trong grid phải có `min-width: 0`; các wrapper trung gian cũng phải cho phép co nếu chúng tham gia intrinsic sizing.

Lý do: `1fr` có minimum intrinsic tương đương `minmax(auto, 1fr)`. Tên dài có thể ép riêng một cột nở ra — designer đã đo ở frame 1280 thành khoảng 190px trong khi các cột khác khoảng 170px. Ellipsis xử lý chiều cao/text overflow; `minmax(0, 1fr)` + `min-width: 0` xử lý nguyên nhân cột không đều. Hai lớp fix phải đi cùng nhau và áp cho mọi viewport, không chỉ 1280.

Patch này không tạo câu hỏi mới cho Claude hoặc anh. Khi port sang Dawn, em áp theo selector/component shared thay vì sao chép 49/50/26 occurrence thủ công; QA thêm tên thương hiệu/loại dài, title dài, badge và swatch để chắc mọi card vẫn co được và các cột bằng nhau.

## 3. Những điểm đã rõ hơn và có thể giữ

### 3.1 Responsive

- Mobile: `< 768px`.
- Tablet: `768–1279px`.
- Desktop: `≥ 1280px`.
- Content desktop cap 1920px; nền vẫn full bleed.
- Điểm kiểm tra trung gian: 560, 700, 900, 1100 và 1600px.
- Hero: mobile 2:3, tablet 16:9, desktop 12:5.
- Banner stack: mobile 9:16, tablet 3:4.
- Complete the Look banner: 3:4 trên mọi viewport.

Đây là cải thiện lớn so với implementation hiện tại đang trộn breakpoint 750/990/1600.

### 3.2 Product rail

- Bản ship handoff 4 thay contract cũ 12 card: Hot Deals có `1 Top Deal + 20 card` ở desktop/tablet, mobile bỏ Top Deal còn 20; Trending và Accessories có 15 card.
- Số cột là hằng số theo nhóm thiết bị: desktop Hot Deals 6, product rail 5; tablet 3; mobile 2. Card width được suy từ page width và gap 12px, không dùng `cardMin`.
- Rail có peek: desktop 84px trước khi trừ gap (sliver thấy 72px); tablet/mobile page ngắn hơn rail 12px và rail full-bleed qua gutter.
- Native scroll snap theo từng card. Arrow/dot desktop đi theo page; tablet/mobile dùng swipe và không có arrow/dot.
- Mọi grid track dùng `minmax(0, 1fr)` và card/grid child dùng `min-width: 0`; không để intrinsic width của text làm lệch cột.
- Dòng “thương hiệu · loại” luôn một dòng và ellipsis khi dài; không được làm card cao hơn card cùng rail.
- Mọi rail dùng cùng shared Product Card, trừ bố cục đặc biệt của Top Deal.

### 3.3 Asset

- Chỉ 9 SVG trong `assets/brands/` được designer đánh dấu production-ready.
- Toàn bộ banner và ảnh product trong ZIP là demo.
- Ảnh sản phẩm production phải lấy từ Shopify product media.
- Ảnh editorial phải đưa vào Shopify Files/image setting và có focal point/alt text.

### 3.4 Token hình ảnh

| Token | Giá trị |
|---|---|
| Volt | `#C7FF32` |
| Ink | `#101318` |
| Paper root | `#FAF9F6` |
| Mist section | `#F4F4F2` |
| Bone media | `#ECEBE7` |
| Sale red | `#D23F31` |
| Slate | `#4B4F57` |
| Font display | Barlow Condensed 800 uppercase |
| Font UI/body | Inter |
| Radius card/banner | 4px |
| Radius pill | 999px |
| Gutter D/T/M | 48/24/16px |

## 4. Câu hỏi gửi chính cho Claude — design FE và hiệu ứng

Đây là các mục thuộc design FE. Sau chỉ đạo owner ngày 10-09, em tự xử lý mọi sai lệch implementation đã có canonical rõ và tự QA khi port; chỉ gửi lại Claude khi hai phương án tạo khác biệt visual rõ hoặc có rủi ro không thể tự khóa an toàn.

### Q-C01 · P0 — Liquid-glass có hai contract trái ngược

**Trạng thái sau handoff 3: EM TỰ HANDLE KHI CODE.** Claude đã chọn phương án A và sửa đúng filter declaration chính. Phần giải thích stale trong component Button không còn là blocker vì canonical values đã rõ; anh và Claude không cần sửa thêm tài liệu.

Đây là lỗi kỹ thuật lớn nhất của bộ handoff.

`Design Material.dc.html` và code đang chạy trong full-page dùng:

- `primitiveUnits="objectBoundingBox"`;
- `#lgCard`: scale `-.0794 / -.1 / -.1206`;
- `#lgBtn`: scale `-.3654 / -.3846 / -.4038`.

Nhưng `Component - CTL Card` lại ghi:

- `userSpaceOnUse`;
- `#lgCard`: `-27 / -34 / -41px`;
- `#lgBtn`: `-19 / -20 / -21px`;
- đồng thời cảnh báo tuyệt đối không dùng `objectBoundingBox` cho card/nút.

`Component - Button` còn tự mâu thuẫn trong cùng một đoạn: vừa nói `objectBoundingBox`, vừa gọi scale là pixel tuyệt đối và ngay sau đó lại cấm lens `objectBoundingBox`.

**Claude đã trả lời:** chọn A — bản full-page dùng `objectBoundingBox` và scale dạng phân số là reference:

- `#lgF`: `-.105 / -.145 / -.19`;
- `#lgCard`: `-.0794 / -.1 / -.1206`;
- `#lgBtn`: `-.3654 / -.3846 / -.4038`.

**Handoff 2 có ba lớp mâu thuẫn; handoff 3 đã sửa phần lớn nhưng vẫn còn dấu vết stale sau:**

1. `Component - Button` vẫn gọi `objectBoundingBox` là “pixel tuyệt đối” cho các giá trị `−0.3654 / −0.3846 / −0.4038`.
2. Ngay trong cùng đoạn, file lại ghi “Không dùng lens hệ objectBoundingBox”, dù canonical vừa được định nghĩa bằng chính hệ đó.
3. Bộ screenshot chỉ có Chromium; ảnh Button/CTL không chứng minh rõ hai kích thước như README mô tả và chưa có Safari proof.

Theo chuẩn W3C, `feDisplacementMap scale` được biểu diễn trong coordinate system do `primitiveUnits` thiết lập; với `objectBoundingBox`, length values là fraction/percentage của bounding box. Vì W3C cũng ghi nhận browser implementation của filter chưa hoàn toàn đồng nhất, reference code đang render có thể được giữ như nghiệm thực tế, nhưng tài liệu không được tiếp tục gọi cùng một giá trị vừa là fraction vừa là px.

**Implementation rule của em:** chỉ port hệ `objectBoundingBox` + phân số canonical; không dùng bảng px/câu cấm bbox stale. Em tự dựng golden state ở ít nhất hai kích thước, QA Chrome/Safari và thêm fallback frost/translucent khi filter không được hỗ trợ hoặc render lỗi.

**Cách em triển khai:** lấy filter declaration canonical đang render làm reference, gom thành một primitive dùng chung và không pha hai hệ. Tài liệu stale được ghi nhận để tránh port nhầm, nhưng không chặn implementation.

### Q-C02 · P0 — Product Card vẫn xung đột với rule đã duyệt

**Trạng thái sau handoff 3: ĐÃ ĐÓNG.** Không hỏi lại anh về business rule vì rule repository đã được duyệt. Claude đã tách rõ visual demo và production canonical; em chịu trách nhiệm giữ markup Dawn hợp lệ khi code.

Prototype tiếp tục dùng một `<a>` bọc toàn card, bên trong có swatch và Quick Add giả dạng `<span>`.

Rule trong repository yêu cầu:

- chỉ media và title dẫn tới PDP;
- swatch là control độc lập;
- Quick Add là button độc lập mở native Dawn modal;
- Quick Add không được kích hoạt PDP navigation.

Bê cấu trúc prototype vào production sẽ gây nested interaction, keyboard/accessibility kém và dễ click nhầm PDP.

**Khuyến nghị:** giữ rule repository. Prototype chỉ là chuẩn hình ảnh; markup production tiếp tục theo Dawn.

**Claude đã trả lời:** media link và title link đi PDP; swatch là button 24×24 với dot 18px; Quick Add là button desktop-only, keyboard focus làm nút hiện; có state rest/hover/focus/pressed/loading/disabled.

**Đã xác minh trong handoff 3:** `Component - Product Card` có cảnh báo `VISUAL DEMO ONLY — DO NOT PORT THIS MARKUP TO SHOPIFY` ngay trên demo và có mục `Production structure — CANONICAL`. Production contract dùng `<article>` không phải link, chỉ media/title đi PDP, swatch là button độc lập và Quick Add dùng Dawn native; không dùng `stopPropagation` để hợp thức hóa button nằm trong anchor.

### Q-C03 · P0 — Panel host có hai cách implementation loại trừ nhau

**Trạng thái sau handoff 2: ĐÃ ĐÓNG VỀ QUYẾT ĐỊNH.** Claude chọn fixed overlay cho production; em sẽ đối chiếu với header/theme shell của Dawn khi triển khai.

`Design Material §8.10` mô tả host dạng sticky với `height:100svh` và `margin-bottom:-100svh`.

`Component - Panel §6` lại nói production phải dùng `position:fixed; inset:0`, đồng thời cảnh báo cách sticky/absolute làm header phình hoặc panel hở đáy. Ngay sau đó tài liệu lại lặp lại contract sticky + margin âm.

**Claude đã trả lời:** production dùng `position:fixed; inset:0`; sticky + height/margin âm chỉ là thủ thuật artboard demo. Design Material và Panel spec hiện đã phân biệt hai môi trường này.

**Khuyến nghị production:** overlay host dùng `position:fixed; inset:0`, có focus trap, body-scroll lock và return focus. Không dùng margin âm để triệt layout cho panel production.

### Q-C04 · P0 — Các con số nguồn chuẩn chưa đồng nhất

**Trạng thái sau handoff 3: EM TỰ HANDLE KHI CODE.** Answer và component canonical đã chọn số đủ rõ. Prototype full-page chưa đồng bộ nhưng em sẽ port canonical tokens, không sao chép occurrence stale.

| Chủ đề | Giá trị A | Giá trị B |
|---|---|---|
| Sign Up | §3.3: h46/46/42, min 112/112/96 | §3.4 mục 4: h44/44/40, min 132 |
| Tab mobile | 10px trong spec mới | Audit trước/ghi chú cũ có 11px |
| CTA stack tablet text offset | 31.4cqw | Code mẫu dùng 29.7cqw |
| Khoảng text → CTA | 64px/20px tùy đoạn | Behaviour table ghi 96px |
| Số cơ chế JS | Tiêu đề ghi 16 | Nội dung nói gom thành 14 |

**Claude đã trả lời:** Sign Up D/T/M `46/46/42`, min-width `112/112/96`; Tab D/T `120×42`, M `104×38`; tab font 11px mọi viewport; CTA tablet `21.1cqw/29.7cqw`; text→CTA D/T/M `24/20/16px`; số cơ chế JS là 16.

Handoff 3 từng còn nhiều mobile tab ở `font:600 10px 'Inter'` và `letter-spacing:0.05em`. Source ship handoff 4 đã loại các occurrence đó; production dùng một shared token canonical `11px/.06em` và em vẫn regression-test toàn homepage khi port. Không cần gửi lại Claude.

### Q-C05 · P1 — Rail sizing, peek và đơn vị cuộn

**Trạng thái sau handoff 4: ĐÃ ĐÓNG.** Không còn câu A/B cần gửi Claude. Bản ship chọn một composition thứ ba rõ hơn hai phương án ở handoff 3 và source render đã đồng bộ:

- gap 12px mọi viewport;
- desktop rail nằm trong content box, `page = railWidth − 84px`, sliver nhìn thấy 72px;
- tablet/mobile rail full-bleed qua gutter, `page = railWidth − 12px`, phần card kế tiếp lộ tại gutter 24/16px;
- cột cố định: Hot Deals desktop 6, product rail desktop 5, tablet 3, mobile 2;
- card width là hệ quả của page width; không còn `30.5cqw`, `cardMin` hoặc `N_PREFERRED` trong canonical source;
- grid track production phải khai `minmax(0, 1fr)` và grid child phải có `min-width: 0` để content dài không phá bề rộng cột;
- native wheel/trackpad snap theo card; nút và dot desktop nhảy theo page; touch không có nút/dot;
- trang cuối clamp sát mép phải, không wrap-around.

Em đã đo trực tiếp source ở 390, 768, 1280, 1440 và 1920; các số khớp bảng nghiệm thu mới trong Design Material. Câu “desktop snap theo page” trong README được hiểu là **đích của nút/dot**, không phải CSS `scroll-snap-align`: source thật đặt snap trên card. Em sẽ port đúng behavior đang render để tránh mismatch preview.

### Q-C06 · P1 — Accessibility chưa có visual-state contract đầy đủ

**Trạng thái sau handoff 2: ĐÃ ĐÓNG Ở MỨC VISUAL CONTRACT.** Claude đã cung cấp focus/selected/disabled/loading/error/empty/reduced-motion/reduced-transparency state. Các semantic production do em triển khai và vẫn phải QA thật.

Prototype là visual/demo nên chưa đủ semantic production. Cần bổ sung:

- tab: `tablist`, `tab`, `aria-selected`, `aria-controls` và keyboard arrow;
- carousel: tên control, pause/play, trạng thái disabled;
- swatch thật sự là button, có tên colorway và selected state;
- panel: dialog semantics, focus trap, Esc, return focus;
- drawer: body scroll lock;
- rail dọc/ngang: keyboard và screen reader không bị kẹt;
- ảnh editorial có alt; ảnh trang trí alt rỗng;
- text trên glass phải pass contrast trong fallback lẫn glass thật.

**Đã thống nhất:** keyboard state không phụ thuộc motion; selected/disabled không chỉ truyền đạt bằng opacity hoặc màu; panel có loading/error/empty; reduced motion tắt choreography và animation nhưng giữ thay đổi màu/ảnh ngắn. Khi code, em vẫn bổ sung đúng role/ARIA, focus trap, return focus, alt và kiểm tra contrast.

## 5. Câu hỏi gửi chính cho anh — store owner

Các mục này là quyết định scope, business rule hoặc conversion. Claude và em đưa khuyến nghị; anh là người chốt. Sau khi anh trả lời, Claude cập nhật đúng UI state và em chuyển thành implementation contract.

### Q-A01 · P0 — Revamp homepage hay cả global site chrome

**ANH ĐÃ CHỐT: A — homepage body trước; global header/panel là phase sau.**

Design mới còn thiết kế lại header hide/show, mega menu desktop, drawer tablet/mobile, Search panel, Account panel, Cart drawer và icon/ring trạng thái. Header/footer là global Shopify theme group; thay chúng sẽ ảnh hưởng collection, PDP, search, cart và toàn storefront.

**Anh cần chọn:**

- Scope A: homepage body trước, giữ global header/panel hiện tại; hoặc
- Scope B: revamp cả global navigation/panel ngay trong đợt này.

**Khuyến nghị của em:** Scope A; tách global shell thành phase/branch sau khi homepage body ổn. Claude không tự mở rộng scope sang toàn site khi chưa có quyết định này.

### Q-A02 · P0 — Complete the Look là showcase hay bundle thật

**ANH ĐÃ CHỐT: B — `SHOP LOOK` phải mua một bundle thật.** Đây không còn là CTA scroll tới product rail.

**Flow production đề xuất:**

1. Bấm `SHOP LOOK` mở **Bundle Builder drawer** của Look đang active.
2. Drawer hiển thị đúng 5 sản phẩm; món có size bắt buộc chọn variant, món one-size tự chọn variant khả dụng.
3. CTA `ADD BUNDLE TO BAG` chỉ bật khi toàn bộ lựa chọn bắt buộc hợp lệ.
4. Một lần submit thêm toàn bộ variant vào cart, gắn bundle/look identifier để hiển thị và kiểm tra cùng nhóm.
5. Cart hiển thị từng component nhưng có summary “Complete the Look” và tổng giá bundle.
6. Discount phải được Shopify bundle/Discount Function/app kiểm tra ở cart/checkout; theme không tự giả giá giảm.
7. Nếu bundle không đủ điều kiện, không áp discount; vẫn có link mua từng sản phẩm riêng.

**Kết quả feasibility:** làm được, nhưng gồm hai lớp khác nhau:

- **Theme layer — repo hiện tại làm được:** Bundle Builder drawer, đọc 5 product reference, chọn variant/size, validate availability, gửi nhiều variant trong một Cart Ajax request, mở/cập nhật Dawn cart drawer và hiển thị trạng thái lỗi.
- **Commerce layer — repo hiện tại chưa có:** bundle identity được Shopify hiểu ở cart/checkout, discount được xác minh server-side, chống bỏ bớt component nhưng vẫn giữ discount, và quy tắc stacking với discount khác. Phần này cần Shopify bundle/app + Function phù hợp; theme JavaScript không được tự sửa giá.

Repository hiện không có `shopify.app.toml`, `shopify.extension.toml` hoặc Function extension. Vì vậy không được estimate `SHOP LOOK` như một section Liquid đơn lẻ. Nên chia thành theme UI và bundle backend, tích hợp trên development/draft theme rồi mới QA end-to-end.

**ANH ĐÃ CHỐT CƠ CHẾ DISCOUNT:** phần trăm giảm bundle phải để anh tự chỉnh về sau trong Shopify Admin, không hard-code trong theme. Cách production phù hợp là Discount Function/app có màn hình cấu hình Admin và lưu configuration bằng metafield; Theme chỉ hiển thị dữ liệu do commerce layer trả về. Có thể đổi phần trăm, thời gian chạy và quy tắc kết hợp discount mà không sửa/redeploy theme.

**Còn anh cần chốt trước khi code commerce layer:** bundle bắt buộc đủ cả 5 món hay cho phép mua 3–5 món; khi một món hết size thì khóa bundle hay cho thay sản phẩm tương đương. Con số phần trăm cụ thể không cần khóa ở stage design vì sẽ là cấu hình Admin.

Claude chỉ cần bàn giao visual/state của Bundle Builder: chọn size, unavailable/partial availability, loading, lỗi add-to-cart và thành công. Logic discount server-side do app/Function đảm trách, không yêu cầu Claude giả lập giá bằng JavaScript.

### Q-A03 · P1 — Hero autoplay

**ANH ĐÃ CHỐT: B — autoplay 10 giây**, có pause/play, dừng sau tương tác và tắt autoplay khi người dùng bật reduced motion.

Design yêu cầu chu kỳ 10 giây, có progress ring và dừng sau khi người dùng tương tác. Theme hiện tại đặt `auto_rotate: false`.

**Anh cần chọn:** mặc định bật autoplay 10 giây hay tắt? Nếu bật, Claude bổ sung pause/play thật; production sẽ dừng với reduced motion và vẫn điều khiển được bằng keyboard.

### Q-A04 · P1 — Quick Add trên tablet/mobile

**ANH ĐÃ CHỐT: A — không hiện Quick Add trên tablet/mobile; media/title dẫn sang PDP.**

Design chốt touch không đổi ảnh thứ hai, không hiện Quick Add, không có carousel arrow và CTA banner luôn ở trạng thái active. Bỏ Quick Add làm thay đổi đường mua nhanh trên mobile.

**Anh cần chọn:** chấp nhận tablet/mobile đi PDP qua media/title, hay yêu cầu Claude thiết kế một Quick Add luôn nhìn thấy trên touch?

**Khuyến nghị của em:** Quick Add trong media chỉ xuất hiện desktop. Nếu mobile cần mua nhanh, phải có button persistent được thiết kế riêng, không dựa vào hover.

### Q-A05 · P1 — Cách tính sale badge cho sản phẩm nhiều variant

**ANH ĐÃ CHỐT: A — badge theo variant đang hiển thị; ban đầu là first available variant.**

**Anh cần chọn:** dùng mức giảm của variant đang hiển thị/first available, mức giảm lớn nhất, hay không hiện phần trăm khi các variant có mức giảm khác nhau?

Rule bắt buộc là không hiện `-0%`, chỉ hiện khi compare-at price lớn hơn price. **Khuyến nghị của em:** dùng variant đang hiển thị/first available để badge và giá không mâu thuẫn.

## 6. Câu hỏi cần anh và Claude cùng chốt

Ở các mục này, Claude phải trình bày phương án visual/FE trước; anh duyệt trải nghiệm và trade-off cuối. Không nên hỏi anh một con số CSS trần, cũng không để Claude tự quyết business impact.

### Q-J01 · P1 — CTL card tại 1280 có thể quá nhỏ

**ANH ĐÃ XÁC NHẬN: A — giữ tỉ lệ 74/24 ở mọi width**, chấp nhận card khoảng 120–126px tại 1280.

Spec tự ghi nhận rail CTL có thể chỉ khoảng 126px tại 1280 do tỉ lệ 74/24. Đây nhỏ hơn card mobile 156px nhưng vẫn chứa swatch, title hai dòng, vendor và giá.

- **Claude trả lời trước:** render 1280/1366, xác nhận readability và đề xuất min-width/tỉ lệ mới nếu 126px không đạt.
- **Anh chốt:** ưu tiên card dễ đọc hay giữ đúng composition banner/rail 74/24 khi hai mục tiêu xung đột.

### Q-J02 · P1 — Sticky stack và hiệu năng cuộn

**ANH ĐÃ XÁC NHẬN: A — giữ sticky stack, CTL rail và header hide/show là hiệu ứng chủ đạo.**

New Arrivals, Accessories và CTL cùng dùng sticky, dwell, negative pull và đo layout liên tục. Cộng header auto-hide, tab sticky và panel overlay, nhiều scroll driver có thể cùng tác động.

Production cần một `requestAnimationFrame` scheduler, chỉ activate section gần viewport, tránh style write không đổi, dùng ResizeObserver khi phù hợp, hỗ trợ reduced motion và không làm hỏng back/forward/anchor. Ngưỡng `hardwareConcurrency/deviceMemory/(update: slow)` trong handoff chỉ nên là tín hiệu khởi tạo, không phải kết luận tuyệt đối; Safari có thể không cung cấp đủ mọi tín hiệu. FPS downgrade phải one-way trong session hoặc có hysteresis để tránh effect bật/tắt liên tục.

- **Claude trả lời trước:** hiệu ứng nào là must-have, hiệu ứng nào có thể giảm/bỏ trên thiết bị yếu hoặc reduced motion; cung cấp behavior fallback.
- **Anh chốt:** khi fidelity xung đột performance, có lấy tốc độ và khả năng mua hàng làm tiêu chí thắng không.

**Khuyến nghị của em:** dựng layout không sticky trước; chỉ bật choreography sau khi pass device thật.

### Q-J03 · P1 — Performance budget và fallback cho animation/glass

**ĐÃ KHÓA: B — ưu tiên full effect trên mọi máy.** Cách hiểu production-safe: không auto-downgrade theo `hardwareConcurrency`, `deviceMemory` hoặc FPS; vẫn fallback nếu browser không hỗ trợ/lens render lỗi và luôn tôn trọng reduced-motion/reduced-transparency do người dùng chủ động bật.

Tài liệu có 4 SVG lens, nhiều spin border liên tục và hơn 50 handler trong demo; chính spec cảnh báo nhiều lens đồng thời có thể làm treo browser.

- **Claude trả lời trước:** fallback tối thiểu nào vẫn đúng design intent — frost/translucent panel, static border hay bỏ lens; quy định pause offscreen/background và reduced-motion state.
- **Anh chốt:** chấp nhận fallback đó trên máy yếu/browser lỗi thay vì cố giữ effect nhưng làm chậm add-to-cart hoặc input.

Khuyến nghị production: Search/Cart full-screen chỉ frost, không lens; animation chỉ chạy khi đang thấy; CTL glass được phép rơi về translucent panel.

### Q-J04 · P0 — Collector's Pick là loại section nào

**ANH ĐÃ XÁC NHẬN: A — carousel 6 collection banner, 3 banner/trang; không phải product rail.**

Design Material có chỗ mô tả 12 product card, nhưng phần kế tiếp ghi 6 banner collection và hiển thị 3 banner mỗi trang. Hai mô hình này khác cả asset, data source và component.

- **Claude trả lời trước:** intended design là collection-banner carousel hay product rail; cung cấp frame/spec chỉ cho một mô hình.
- **Anh chốt:** section dùng để dẫn vào collection được curate hay bán trực tiếp từng sản phẩm.

### Q-J05 · P1 — Hero dùng một master hay ba creative D/T/M

**ANH ĐÃ CHỐT: A — hai image setting tùy chọn.** Desktop/tablet dùng master ngang; mobile ưu tiên master dọc; nếu mobile image trống thì fallback về master ngang + focal point.

- **Claude trả lời trước:** thử crop cùng một master ở 2:3, 16:9 và 12:5, chỉ ra vùng mất nội dung và tiêu chí focal point.
- **Anh chốt:** chấp nhận một master + focal point hay đầu tư ba creative riêng cho mỗi slide.

Một master giúp giảm đáng kể khối lượng asset và quản lý Theme Editor; ba creative cho phép kiểm soát composition tốt hơn.

Shopify hỗ trợ focal point cho ảnh từ `image_picker`; `image_tag` tự xuất responsive `srcset` và `object-position` theo focal point. Vì vậy blocker kỹ thuật “Shopify có crop linh hoạt không” đã được trả lời là **có**. Tuy nhiên focal point chỉ giữ một điểm quan trọng trong khung, không thể cứu composition khi desktop 12:5 và mobile 2:3 cần bố cục chủ thể khác nhau.

**Khuyến nghị của em:** section có hai image setting tùy chọn: desktop/tablet master ngang và mobile master dọc. Nếu mobile image trống thì fallback về master ngang + focal point. Đây chính là policy blend Claude đề xuất, nhưng anh cần xác nhận nó là quyết định cuối.

## 7. Data contract cần align với agent phụ trách collection/product

Phần import không thuộc scope homepage, nhưng theme cần nhận contract ổn định sau:

### 7.1 Collection identity

README nói 80 collection, còn CSV có 143 dòng triển khai. CSV hiện có một tên trùng `Socks — Kids` và nhiều dòng có thể thực chất trỏ về cùng một collection, ví dụ Sale ở Quick Links và All Sale.

Agent dữ liệu cần trả về cho homepage:

- `canonical_handle` hoặc Shopify collection GID;
- collection nào là canonical, collection nào chỉ là placement/link alias;
- collection nào curated, collection nào automated;
- thứ tự sản phẩm đã được curate;
- fallback khi collection chưa đủ 12 sản phẩm.

Không nên để theme tự suy handle từ label hiển thị.

### 7.2 Feed động

Shopify hỗ trợ collection condition theo tag, category, price, compare-at price, inventory và metafield đã bật cho collection. Tuy nhiên các khái niệm như `views_7d`, `units_sold_30d`, `discount_pct`, `current week`, `in_stock_sizes` hoặc `restock=false` cần được agent/backend materialize thành metafield/tag hoặc collection đã tính sẵn; Liquid homepage không nên tự tính toàn catalog.

Contract tối thiểu cho mỗi homepage rail:

- collection handle/GID;
- tối đa 12 sản phẩm đã sort;
- Top Deal product hoặc quy tắc fallback rõ;
- trạng thái đủ/thiếu dữ liệu;
- timestamp nếu feed có thời hạn.

### 7.3 Complete the Look

Đề xuất metaobject `look`:

- handle/title;
- audience/category;
- eyebrow/headline/copy;
- banner image + alt/focal point;
- danh sách đúng 5 product reference có thứ tự;
- CTA label/link;
- bundle price/discount chỉ thêm nếu commerce logic đã tồn tại.

Shopify theme setting `product_list` hỗ trợ tới 50 sản phẩm, nên 5 sản phẩm/look không có vấn đề. `metaobject_list` cũng có thể dùng để cho merchant chọn và sắp xếp nhiều Look trong Theme Editor.

### 7.4 Catalog hiện tại

Baseline repository mới nhất ghi nhận:

- 129 sản phẩm Foot Locker active/published;
- 912 size variant;
- 608 Shopify CDN image;
- mọi sản phẩm sạch có ít nhất 3 media;
- storefront dùng USD;
- collection homepage hiện tại đã được thay bằng sản phẩm sạch.

Vì vậy homepage có đủ nền tảng product/media để dựng golden rail bằng dữ liệu thật. Không dùng ảnh product trong ZIP.

## 8. Asset audit

### Có thể dùng

- 9 logo SVG brand, sau khi xác nhận nguồn/quyền sử dụng và kiểm tra viewBox/padding khi đưa vào theme.

### Chỉ để demo

- Toàn bộ `assets/p/`.
- Hero, activity, campaign, app, journal và CTL banner trong `assets/`.
- Các AVIF Complete the Look.
- Link ảnh từ `static.nike.com` vẫn còn trong demo code.

`peg42-alt.webp` rõ và phù hợp để minh họa layout; `peg42-5.jpg` vẫn là ảnh blur rõ rệt. Vì README đã đánh dấu tất cả là demo nên đây không còn là blocker production, nhưng không được vô tình copy file blur vào Shopify.

### Khối lượng editorial cần chuẩn bị

Theo Design Material, content team cần khoảng:

- 24 banner Activity;
- 9 banner New Arrivals;
- 8 banner Complete the Look;
- 6 banner Collector's Pick;
- 4 Hero × 3 ratio nếu dùng creative riêng theo viewport;
- 1 banner Trending;
- 3 ảnh Journal;
- 1 app mockup và 1 QR.

Tổng khoảng 65 asset editorial nếu Hero thực sự cần ba file riêng cho mỗi slide. Quyết định một master hay ba creative được theo dõi tại `Q-J05`.

## 9. Kiến trúc implementation đề xuất

### Giữ nguyên

- Dawn và Shopify section architecture.
- Global header/footer theme group.
- Shared `card-product`.
- Colorway metaobject hiện có; mỗi colorway là một product riêng.
- Dawn native Quick Add modal/product form.
- Shopify product media và image pipeline.
- Top Deal logic đã duyệt.

### Refactor có kiểm soát

- Tách homepage CSS thành token/primitives/component, không nối thêm override vào file 600+ dòng.
- Homepage dùng breakpoint 768/1280 được scope riêng; không đổi breakpoint toàn Dawn.
- Shared primitive: container, section header, tab, button, rail, banner, product card.
- JavaScript dùng event delegation và một scroll scheduler.
- Glass là progressive enhancement, không phải cấu trúc layout.

### Không copy từ prototype

- full-card anchor;
- swatch/Quick Add bằng `<span>`;
- product arrays demo;
- external Nike URL;
- data URI image-slot;
- 53 handler theo nguyên trạng;
- panel demo cart/account thay cho logic Shopify thật;
- absolute positioning toàn trang;
- header/footer duplicate.

## 10. Workflow giảm rework

### Gate 0 — khóa design contract

**Đã pass bằng handoff 4.** Owner decisions đã khóa đủ cho foundation/golden rail; `Q-C01` và `Q-C04` do em tự xử lý theo canonical khi port; `Q-C05` đã khóa bằng source render thật. Không cần Claude sửa documentation/screenshot lịch sử trước khi bắt đầu.

### Gate 1 — foundation

Làm token, typography, container, button và tab. Chưa làm sticky hoặc glass phức tạp.

### Gate 2 — golden product rail

Dùng một collection thật từ catalog mới để hoàn thiện:

- Product Card markup Dawn;
- metadata brand/type một dòng + ellipsis; test nội dung dài không làm lệch chiều cao card;
- rail grid dùng `minmax(0, 1fr)` và shrink chain `min-width: 0`; đo các cột bằng nhau tại 1280;
- colorway;
- ảnh phụ/zoom fallback;
- badge/price;
- native Quick Add;
- tab;
- arrow/swipe/dots;
- rail composition và carousel affordance.

Chỉ chuyển sang section khác sau khi pass 390, 768/834, 1280, 1440 và 1920.

### Gate 3 — homepage body

Hero, Quick Links, Activity, Hot Deals, New Arrivals, Trending, Collector's Pick, Brand, Accessories, Journal và App Promo.

### Gate 4 — CTL baseline

Metaobject Look + banner + rail. Chưa sticky/glass/bundle.

### Gate 5 — choreography và glass

Thêm sticky, CTA push, CTL slide-in và glass theo từng checkpoint, có fallback.

### Gate 6 — global shell nếu được duyệt

Header, mega menu, Search, Account và Cart thành một scope riêng, QA trên homepage, collection, PDP, search và cart.

### Gate 7 — integrated QA

QA 390, 560, 700, 768, 834, 900, 1024, 1100, 1280, 1366, 1440, 1600, 1920, 2560 và 3840; Chrome, Safari và iOS Safari; keyboard, touch, reduced motion, content dài, ảnh lỗi và dữ liệu thiếu.

Chỉ upload draft/development theme để review. Live publish cần anh xác nhận riêng.

## 11. Decision register — ai trả lời và ai chốt

### 11.1 Claude trả lời chính

| ID | Priority | Cần Claude bàn giao | Trạng thái sau handoff 4 |
|---|---|---|---|
| `Q-C01` | P0 | Một hệ lens unit + filter canonical | **Em tự handle** — port bbox fraction canonical; tự QA/fallback Chrome + Safari |
| `Q-C02` | P0 | Product Card state không dùng full-card anchor | **Đã đóng** — demo-only label + production canonical đã có |
| `Q-C03` | P0 | Một panel-host contract duy nhất | **Đã trả lời đạt** — production fixed overlay |
| `Q-C04` | P0 | Bộ số/token canonical, xoá giá trị trùng lệch | **Em tự handle** — production dùng shared token `11px/.06em` |
| `Q-C05` | P1 | Chốt composition rail | **Đã đóng** — peek 84 desktop/12 touch; 6/5/3/2 cột; snap card, button/dot đi page |
| `Q-C06` | P1 | Focus/selected/disabled/error/reduced-motion states | **Visual contract đạt** — semantic/QA để production |

### 11.2 Anh quyết định chính

| ID | Priority | Anh cần chốt | Trạng thái |
|---|---|---|---|
| `Q-A01` | P0 | Homepage body hay cả global shell | **Đã chốt A** — homepage body trước |
| `Q-A02` | P0 | CTL showcase/chọn từng món hay bundle thật | **Đã chốt B** — Bundle Builder + discount thật; % chỉnh trong Admin; còn full-5/partial và sold-out rule |
| `Q-A03` | P1 | Hero autoplay bật hay tắt | **Đã chốt B** — 10 giây + pause/reduced motion |
| `Q-A04` | P1 | Có Quick Add trên touch hay không | **Đã chốt A** — touch đi PDP |
| `Q-A05` | P1 | Công thức sale badge nhiều variant | **Đã chốt A** — displayed/first available variant |

### 11.3 Claude đề xuất trước, anh duyệt cuối

| ID | Priority | Handoff ghi nhận | Trạng thái audit |
|---|---|---|---|
| `Q-J01` | P1 | Giữ CTL 74/24, chấp nhận card nhỏ tại 1280 | **Anh đã xác nhận A** |
| `Q-J02` | P1 | Giữ must-have sticky | **Anh đã xác nhận A** |
| `Q-J03` | P1 | Full effect trên mọi máy | **Đã khóa B** — không auto downgrade; vẫn fallback lỗi/unsupported và theo user preference |
| `Q-J04` | P0 | 6 collection banner, 3/trang | **Anh đã xác nhận A** |
| `Q-J05` | P1 | Ưu tiên 2 master, thiếu mobile thì crop ngang | **Anh đã xác nhận A** |

Contract gửi agent collection/product nằm riêng ở mục 7 vì đây là đầu vào tích hợp, không phải nhóm câu hỏi để anh hoặc Claude chịu trách nhiệm import.

## 12. Nguồn Shopify dùng để đối chiếu

- [Điều kiện automated collection](https://help.shopify.com/en/manual/products/collections/conditions): Shopify hỗ trợ price, compare-at price, inventory, tag, category và metafield; điều kiện metafield phải được bật cho collection.
- [Theme input settings](https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings): `product_list` hỗ trợ tối đa 50 product và có `metaobject_list` cho dữ liệu có cấu trúc.
- [Dynamic sources](https://shopify.dev/docs/storefronts/themes/architecture/settings/dynamic-sources): metaobject/metafield có thể nối vào section settings, với các giới hạn dynamic source cần được tôn trọng.
- [Admin GraphQL `collectionCreate`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/collectionCreate): collection có thể được tạo bằng API với source/rule rõ ràng; CSV handoff cần được agent dữ liệu chuyển thành payload phù hợp thay vì để theme đọc trực tiếp.
- [Shopify theme input settings — focal point](https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings#image-focal-points): ảnh từ `image_picker` hỗ trợ focal point; `image_tag` có thể tự áp `object-position` và tạo responsive image output.
- [Build a discount UI extension](https://shopify.dev/docs/apps/build/discounts/build-ui-extension): merchant có thể tạo/chỉnh cấu hình discount trong Shopify Admin; UI extension lưu cấu hình cho Discount Function bằng metafield thay vì hard-code trong theme.
- [W3C Filter Effects — `feDisplacementMap`](https://www.w3.org/TR/filter-effects-1/#feDisplacementMapElement): `scale` dùng coordinate system do `primitiveUnits` thiết lập; tài liệu cũng lưu ý browser implementations chưa hoàn toàn đồng nhất, nên lens cần golden screenshot và cross-browser QA.

## 13. Giới hạn của lần audit này

Handoff 4 vẫn dùng lại 5 PNG của handoff 3 và chưa có bộ screenshot QA toàn homepage. Em đã thay phần chứng minh rail bằng đo trực tiếp source render ở 390/768/1280/1440/1920 và kiểm tra console; chưa coi đó là production QA. Pixel/crop, Safari/iOS Safari, keyboard/touch, Shopify data thật và lens fallback vẫn phải kiểm lại sau khi port vào Dawn.

## 14. Trạng thái hiện tại

- Branch audit đã fast-forward an toàn từ `727b92f` lên `4404f75`.
- `HEAD`, `origin/main` và `origin/HEAD` đang cùng ở `4404f75`.
- File audit là thay đổi duy nhất chưa commit.
- Chưa sửa Liquid/CSS/JavaScript theme.
- Chưa upload hoặc publish Shopify.

## 15. Bước tiếp theo

1. Không cần gửi thêm câu hỏi design FE cho Claude ở thời điểm này; dùng source handoff 4 làm visual canonical.
2. Em chuyển các số/tương tác đã khóa thành implementation contract cho Dawn, sau đó mới bắt đầu Gate 1–2 khi anh cho triển khai.
3. Em tự khóa lens, tab token, browser proof và responsive measurements trong implementation; không chờ Claude sửa documentation lịch sử.
4. Anh chỉ còn quyết business rule full 5 món hay partial và sold-out/substitution trước khi làm commerce layer; phần trăm discount sẽ chỉnh trong Admin.
5. Khi mình bắt đầu code mới cập nhật `PROJECT_HANDOFF.md` theo checkpoint rồi commit/push; không trộn file design demo hoặc asset demo vào theme.

Chưa commit/push ở stage align này. Không cần chờ Claude “làm sạch” những lỗi em có thể tự hấp thụ an toàn khi code.
