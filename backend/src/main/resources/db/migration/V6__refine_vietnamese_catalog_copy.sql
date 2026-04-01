UPDATE categories
SET description = CASE slug
    WHEN 'lifestyle' THEN 'Những mẫu giày đi hằng ngày tập trung vào độ êm, chất liệu tốt và phom hiện đại.'
    WHEN 'running' THEN 'Dòng giày chạy bộ cho bài tập tốc độ, chạy hằng ngày và bước chân ổn định.'
    WHEN 'court' THEN 'Phong cách court cổ điển được làm mới để hợp streetwear và mặc thường ngày.'
    WHEN 'trail' THEN 'Độ bám tốt, thân giày bền và sẵn sàng cho địa hình hỗn hợp.'
    ELSE description
END;

UPDATE shoes
SET silhouette = CASE slug
        WHEN 'new-balance-9060-drift-sand' THEN 'Lifestyle đế dày'
        WHEN 'asics-gel-kayano-skyline' THEN 'Running trợ lực'
        WHEN 'nike-vomero-18-ember' THEN 'Running đệm dày'
        WHEN 'adidas-samba-og-pearl' THEN 'Court cổ điển'
        WHEN 'salomon-xa-pro-ridge' THEN 'Trail kỹ thuật'
        WHEN 'on-cloudmonster-mist' THEN 'Hiệu năng đa dụng'
        ELSE silhouette
    END,
    short_description = CASE slug
        WHEN 'new-balance-9060-drift-sand' THEN 'Phom đế dày êm chân, tông màu trung tính và dễ phối đồ hằng ngày.'
        WHEN 'asics-gel-kayano-skyline' THEN 'Mẫu giày ổn định cho người chạy nhiều nhưng vẫn muốn ngoại hình nổi bật.'
        WHEN 'nike-vomero-18-ember' THEN 'Đệm mềm độ dày cao, phù hợp cho ngày tập nặng và cả mặc thường ngày.'
        WHEN 'adidas-samba-og-pearl' THEN 'Biểu tượng low-profile với chất da mềm và đế gum tươi tắn.'
        WHEN 'salomon-xa-pro-ridge' THEN 'Độ bám cao, quick-lace tiện dụng và hợp cả phố thị lẫn đường trail.'
        WHEN 'on-cloudmonster-mist' THEN 'Cảm giác đàn hồi đặc trưng của On trong một tổng thể tối giản và cao cấp.'
        ELSE short_description
    END,
    description = CASE slug
        WHEN 'new-balance-9060-drift-sand' THEN 'New Balance 9060 Drift Sand dùng ngôn ngữ thiết kế lưu trữ của thương hiệu để tạo nên một đôi lifestyle êm chân, dễ mang và có độ nhận thị giác rõ ràng. Đây là lựa chọn flagship cho khách hàng muốn độ êm cao, phom đế dày và khả năng phối đồ linh hoạt.'
        WHEN 'asics-gel-kayano-skyline' THEN 'Gel Kayano Skyline là lựa chọn running ổn định cho người cần một đôi giày có trợ lực tốt trong các buổi chạy dài. Upper gọn gàng giúp đôi giày vẫn phù hợp với nhịp sống hằng ngày thay vì chỉ dành cho bài tập.'
        WHEN 'nike-vomero-18-ember' THEN 'Vomero 18 Ember đặt trọng tâm vào trải nghiệm đệm mềm và đế dày cao, giúp phục hồi và chạy hằng ngày thoải mái hơn. Bảng màu sáng và nóng giúp đôi giày vẫn giữ được tính thời trang khi lên kệ.'
        WHEN 'adidas-samba-og-pearl' THEN 'Samba OG Pearl giữ lại DNA sân court quen thuộc nhưng làm mới bằng chất liệu mềm hơn và tông màu sạch sẽ. Đây là sản phẩm neo hình ảnh cho storefront nhờ độ nhận diện cao và dễ tiếp cận nhiều tệp khách hàng.'
        WHEN 'salomon-xa-pro-ridge' THEN 'XA Pro Ridge bổ sung trụ cột trail cho catalog với độ bám cao, lớp phủ bảo vệ và cơ chế quick-lace đặc trưng. Mẫu này phù hợp cả styling gorpcore lẫn nhu cầu di chuyển ngoài trời thực tế.'
        WHEN 'on-cloudmonster-mist' THEN 'Cloudmonster Mist kết hợp ngôn ngữ hiệu năng của On với bề ngoài tối giản, cao cấp và dễ mặc thường ngày. Cấu trúc đế độc đáo giúp storefront truyền tải rõ tính công nghệ mà vẫn giữ được cảm giác thời trang.'
        ELSE description
    END,
    highlights = CASE slug
        WHEN 'new-balance-9060-drift-sand' THEN 'Đệm ABZORB êm ái|Upper mesh và suede nhiều lớp|Đế ngoài tạo hình nổi bật'
        WHEN 'asics-gel-kayano-skyline' THEN 'Bước chạy ổn định|Upper lưới thoáng khí|Đệm dài nhịp cho quãng đường xa'
        WHEN 'nike-vomero-18-ember' THEN 'Đệm dày cho ngày chạy dài|Chuyển bước mượt|Bảng màu nổi bật giới hạn'
        WHEN 'adidas-samba-og-pearl' THEN 'Da mềm hoàn thiện sạch|Đế gum cổ điển|Phom thấp dễ phối'
        WHEN 'salomon-xa-pro-ridge' THEN 'Độ bám đa địa hình|Quick-lace khóa nhanh|Lớp phủ upper bảo vệ'
        WHEN 'on-cloudmonster-mist' THEN 'Đệm CloudTec đàn hồi|Hiệu năng cho cả ngày dài|Hoàn thiện tối giản cao cấp'
        ELSE highlights
    END;
