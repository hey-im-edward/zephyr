UPDATE categories
SET description = CASE slug
    WHEN 'lifestyle' THEN 'Nhung mau giay di hang ngay tap trung vao do em, chat lieu tot va form hien dai.'
    WHEN 'running' THEN 'Dong giay chay bo cho bai tap toc do, chay hang ngay va buoc chan on dinh.'
    WHEN 'court' THEN 'Phong cach court co dien duoc lam moi de hop streetwear va mac thuong ngay.'
    WHEN 'trail' THEN 'Do bam tot, than giay ben va san sang cho dia hinh hon hop.'
    ELSE description
END;

UPDATE shoes
SET silhouette = CASE slug
        WHEN 'new-balance-9060-drift-sand' THEN 'Lifestyle de day'
        WHEN 'asics-gel-kayano-skyline' THEN 'Running tro luc'
        WHEN 'nike-vomero-18-ember' THEN 'Running dem day'
        WHEN 'adidas-samba-og-pearl' THEN 'Court co dien'
        WHEN 'salomon-xa-pro-ridge' THEN 'Trail ky thuat'
        WHEN 'on-cloudmonster-mist' THEN 'Hieu nang da dung'
        ELSE silhouette
    END,
    short_description = CASE slug
        WHEN 'new-balance-9060-drift-sand' THEN 'Phom de day mem chan, tong mau trung tinh va de phoi do hang ngay.'
        WHEN 'asics-gel-kayano-skyline' THEN 'Mau giay on dinh cho nguoi chay nhieu nhung van muon ngoai hinh noi bat.'
        WHEN 'nike-vomero-18-ember' THEN 'Dem mem do day cao, phu hop cho ngay tap nang va ca mac thuong ngay.'
        WHEN 'adidas-samba-og-pearl' THEN 'Bieu tuong low-profile voi chat da mem va de gum tuoi tan.'
        WHEN 'salomon-xa-pro-ridge' THEN 'Do bam cao, quick-lace tien dung va hop ca pho thi lan duong trail.'
        WHEN 'on-cloudmonster-mist' THEN 'Cam giac dan hoi dac trung cua On trong mot tong the toi gian va cao cap.'
        ELSE short_description
    END,
    description = CASE slug
        WHEN 'new-balance-9060-drift-sand' THEN 'New Balance 9060 Drift Sand dung ngon ngu thiet ke luu tru cua thuong hieu de tao nen mot doi lifestyle mem chan, de mang va co do nhan thi giac ro rang. Day la lua chon flagship cho khach hang muon do em cao, phom de day va kha nang phoi do linh hoat.'
        WHEN 'asics-gel-kayano-skyline' THEN 'Gel Kayano Skyline la lua chon running on dinh cho nguoi can mot doi giay co tro luc tot trong cac buoi chay dai. Upper gon gang giup doi giay van phu hop voi nhip song hang ngay thay vi chi danh cho bai tap.'
        WHEN 'nike-vomero-18-ember' THEN 'Vomero 18 Ember dat trong tam vao trai nghiem dem mem va de day cao, giup phuc hoi va chay hang ngay thoai mai hon. Bang mau sang va nong giup doi giay van giu duoc tinh thoi trang khi len ke.'
        WHEN 'adidas-samba-og-pearl' THEN 'Samba OG Pearl giu lai DNA san court quen thuoc nhung lam moi bang chat lieu mem hon va tong mau sach se. Day la san pham neo hinh anh cho storefront nho do nhan dien cao va de tiep can nhieu tap khach hang.'
        WHEN 'salomon-xa-pro-ridge' THEN 'XA Pro Ridge bo sung tru cot trail cho catalog voi do bam cao, lop phu bao ve va co che quick-lace dac trung. Mau nay phu hop ca styling gorpcore lan nhu cau di chuyen ngoai troi thuc te.'
        WHEN 'on-cloudmonster-mist' THEN 'Cloudmonster Mist ket hop ngon ngu hieu nang cua On voi be ngoai toi gian, cao cap va de mac thuong ngay. Cau truc de doc dao giup storefront truyen tai ro tinh cong nghe ma van giu duoc cam giac thoi trang.'
        ELSE description
    END;
