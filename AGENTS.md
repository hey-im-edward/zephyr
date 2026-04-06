# Global Engineering Rules

## Phạm vi áp dụng

Tài liệu này áp dụng cho toàn bộ workspace/repository gốc và tất cả project con, module con, package con, tài liệu, script, automation, và quy trình làm việc liên quan.

Đây là bộ rule tổng hợp theo thông lệ kỹ thuật phổ biến được áp dụng rộng rãi tại các công ty công nghệ lớn quốc tế, ưu tiên tính rõ ràng, khả năng mở rộng, tính an toàn, và khả năng vận hành lâu dài.

## Quy ước mức độ bắt buộc

- `BẮT BUỘC`: không được bỏ qua nếu không có phê duyệt ngoại lệ bằng văn bản.
- `NÊN`: áp dụng mặc định; chỉ được bỏ qua khi có lý do kỹ thuật hợp lệ.
- `CÓ THỂ`: tùy chọn khi phù hợp với bối cảnh.

## 1. Nguyên tắc cốt lõi

- `BẮT BUỘC` ưu tiên giá trị thực tế cho người dùng và mục tiêu kinh doanh trước độ phức tạp kỹ thuật không cần thiết.
- `BẮT BUỘC` tối ưu cho tính đúng, tính ổn định, tính bảo trì, tính bảo mật, và khả năng mở rộng.
- `BẮT BUỘC` mọi quyết định kỹ thuật quan trọng phải có lý do rõ ràng, có thể giải thích, và có thể kiểm chứng.
- `BẮT BUỘC` ưu tiên giải pháp đơn giản nhất có thể đáp ứng yêu cầu hiện tại và mở rộng hợp lý cho tương lai.
- `BẮT BUỘC` không đánh đổi tốc độ bằng cách bỏ qua test, review, logging, hoặc tài liệu cho các phần thay đổi quan trọng.

## 2. Chính sách ngôn ngữ và tài liệu

- `BẮT BUỘC` mọi câu trả lời gửi cho chủ dự án phải viết bằng tiếng Việt.
- `BẮT BUỘC` mọi tài liệu của dự án phải viết bằng tiếng Việt.
- `BẮT BUỘC` chỉ giữ tiếng Anh cho:
  - thuật ngữ chuyên ngành cần giữ nguyên nghĩa,
  - tên công nghệ, framework, library, API, protocol,
  - tên file, tên biến, tên hàm, commit message kỹ thuật khi cần,
  - code và câu lệnh terminal.
- `BẮT BUỘC` mọi thuật ngữ tiếng Anh quan trọng, đoạn code, câu lệnh, hoặc khái niệm kỹ thuật xuất hiện trong tài liệu phải có chú thích hoặc giải thích bằng tiếng Việt ngay cạnh nó hoặc ngay bên dưới nó.
- `BẮT BUỘC` không viết tài liệu kiểu nửa Anh nửa Việt một cách tùy tiện; nếu dùng tiếng Anh thì phải có mục đích rõ ràng.
- `NÊN` ưu tiên cách viết ngắn gọn, chính xác, có cấu trúc, dễ bàn giao và dễ audit.

## 3. Rule bắt buộc về Skill và năng lực thực thi

- `BẮT BUỘC` phải sử dụng skill liên quan đến yêu cầu khi trong môi trường có skill phù hợp và skill đó thực sự giúp nâng cao chất lượng kết quả.
- `BẮT BUỘC` khi có nhiều skill phù hợp, phải chọn tập skill tối thiểu nhưng đúng và đủ, tránh dùng skill không liên quan.
- `BẮT BUỘC` phải tuân thủ đúng workflow của skill được chọn trước khi thực hiện code, review, tài liệu, deploy, debug, hay automation.
- `BẮT BUỘC` nếu không có skill phù hợp, phải nói rõ không có skill tương ứng và quay về quy trình kỹ thuật chuẩn trong tài liệu này.
- `BẮT BUỘC` không được bỏ qua skill liên quan chỉ vì muốn làm nhanh.

## 4. Quy trình thực thi chuẩn

### 4.1 Tiếp nhận và làm rõ yêu cầu

- `BẮT BUỘC` làm rõ mục tiêu, phạm vi, ràng buộc, tiêu chí chấp nhận, và mức độ ưu tiên trước khi sửa đổi lớn.
- `BẮT BUỘC` xác định rõ đầu vào, đầu ra mong muốn, giả định đang sử dụng, và điểm mờ còn thiếu.
- `NÊN` tách riêng `must-have`, `should-have`, `nice-to-have` để tránh trôi phạm vi.

### 4.2 Khảo sát và hiểu bối cảnh

- `BẮT BUỘC` đọc code, tài liệu, cấu trúc hệ thống, dependency, và luồng nghiệp vụ liên quan trước khi đề xuất hoặc sửa đổi.
- `BẮT BUỘC` không đoán mô hình hệ thống khi chưa kiểm tra bối cảnh thật trong repo hoặc hệ thống liên quan.
- `NÊN` xác định sớm các điểm rủi ro: boundary, side effect, dữ liệu nhạy cảm, dependency ngoài, hiệu năng, backward compatibility.

### 4.3 Thiết kế và đề xuất giải pháp

- `BẮT BUỘC` với thay đổi mức trung bình trở lên, phải có đề xuất ngắn gọn mô tả:
  - vấn đề,
  - phương án chọn,
  - phương án bỏ,
  - trade-off,
  - rủi ro,
  - cách kiểm chứng.
- `BẮT BUỘC` ưu tiên thiết kế có tính module, tách biệt trách nhiệm, dễ test, dễ thay thế.
- `NÊN` lưu quyết định kiến trúc quan trọng thành ADR ngắn gọn bằng tiếng Việt.

### 4.4 Triển khai

- `BẮT BUỘC` thực hiện thay đổi theo increment nhỏ, có thể review, có thể rollback, hạn chế sửa rộng không cần thiết.
- `BẮT BUỘC` giữ backward compatibility khi hệ thống đang được sử dụng, trừ khi có kế hoạch migration rõ ràng.
- `BẮT BUỘC` không sửa các file, module, hoặc hành vi không liên quan trực tiếp đến yêu cầu, trừ khi cần thiết và đã nêu lý do rõ ràng.
- `NÊN` thêm comment ngắn gọn bằng tiếng Việt cho những logic không tự minh bạch.

### 4.5 Kiểm thử và xác minh

- `BẮT BUỘC` mọi thay đổi phải được xác minh bằng cách phù hợp: unit test, integration test, end-to-end test, lint, type-check, manual verification, hoặc canary validation.
- `BẮT BUỘC` với bug fix, cần có cách tái hiện lỗi trước và cách xác nhận lỗi đã hết sau khi sửa.
- `BẮT BUỘC` với thay đổi có ảnh hưởng đến UI/UX, cần kiểm tra trên kích thước màn hình và trạng thái chính.
- `BẮT BUỘC` với thay đổi liên quan data, migration, auth, payment, deploy, hoặc production flow, phải có bước kiểm tra bổ sung và kế hoạch rollback.

### 4.6 Code Review

- `BẮT BUỘC` mọi thay đổi quan trọng phải qua review trước khi merge.
- `BẮT BUỘC` review phải tập trung vào:
  - correctness,
  - security,
  - data integrity,
  - performance,
  - maintainability,
  - test coverage,
  - operational risk.
- `BẮT BUỘC` không merge chỉ vì code "chạy được" nếu vẫn còn rủi ro về hành vi, regression, hoặc thiếu kiểm chứng.
- `NÊN` thay đổi lớn hoặc nhạy cảm cần tối thiểu 2 cấp review nếu quy mô đội/đối tác cho phép.

### 4.7 Tài liệu và bàn giao

- `BẮT BUỘC` mọi thay đổi ảnh hưởng đến cách dùng, vận hành, cấu hình, hoặc architecture phải cập nhật tài liệu.
- `BẮT BUỘC` tài liệu bàn giao phải trả lời được:
  - đã thay đổi gì,
  - tại sao thay đổi,
  - ảnh hưởng đến đâu,
  - cách kiểm tra,
  - cách vận hành,
  - cách rollback nếu cần.
- `NÊN` tài liệu hướng đến người đọc thực tế: dev mới, reviewer, operator, và chủ dự án.

### 4.8 Phát hành và hậu kiểm

- `BẮT BUỘC` thay đổi có ảnh hưởng production phải có release note ngắn gọn, rollback plan, và điểm theo dõi sau release.
- `BẮT BUỘC` sau release phải theo dõi log, metric, error rate, và phản hồi người dùng nếu thay đổi có rủi ro.
- `BẮT BUỘC` với sự cố, phải có postmortem không đổ lỗi cá nhân, tập trung vào root cause, tác động, hành động khắc phục, và phòng ngừa lặp lại.

## 5. Chuẩn kỹ thuật và chất lượng

- `BẮT BUỘC` code phải nhất quán với conventions của repo và ecosystem đang dùng.
- `BẮT BUỘC` ưu tiên readability hơn cleverness.
- `BẮT BUỘC` tránh abstraction sớm, generic hóa sớm, hoặc tối ưu sớm khi chưa có nhu cầu thực tế.
- `BẮT BUỘC` dependency mới phải có lý do rõ ràng; ưu tiên dependency đáng tin cậy, được bảo trì tốt, và ít rủi ro chain supply.
- `BẮT BUỘC` không hard-code secret, token, key, password, hoặc cấu hình nhạy cảm trong code hoặc tài liệu.
- `BẮT BUỘC` input quan trọng phải được validate; output quan trọng phải được xác minh ở boundary phù hợp.
- `BẮT BUỘC` error handling phải rõ ràng, không nuốt lỗi im lặng nếu lỗi đó ảnh hưởng đến hành vi hoặc vận hành.
- `BẮT BUỘC` logging phải đủ thông tin để debug nhưng không làm lộ dữ liệu nhạy cảm.
- `BẮT BUỘC` những luồng nghiệp vụ quan trọng phải có metric hoặc dấu vết để quan sát.
- `NÊN` mỗi function/module nên có một trách nhiệm rõ ràng.

## 6. Bảo mật, riêng tư, compliance

- `BẮT BUỘC` áp dụng principle of least privilege, chỉ cấp quyền tối thiểu cần thiết.
- `BẮT BUỘC` xác định và bảo vệ dữ liệu nhạy cảm, PII, token, secret, và tài nguyên production.
- `BẮT BUỘC` đánh giá security impact khi thay đổi liên quan auth, file upload, external input, serialization, template rendering, query building, webhook, payment, và permission.
- `BẮT BUỘC` không đưa secret thật vào log, screenshot, tài liệu, commit, issue, hay comment.
- `NÊN` ưu tiên secure-by-default: config an toàn là mặc định, không đẩy rủi ro cho người dùng hoặc operator.

## 7. Quy tắc giao tiếp và hợp tác

- `BẮT BUỘC` giao tiếp trực diện, rõ ràng, có cơ sở kỹ thuật, tránh mơ hồ, tránh lãng phí thời gian đọc.
- `BẮT BUỘC` nếu có giả định, rủi ro, giới hạn, hoặc điểm chưa chắc chắn, phải nói rõ.
- `BẮT BUỘC` khi báo cáo kết quả, phải nêu:
  - kết quả chính,
  - file/phần hệ thống bị ảnh hưởng,
  - cách đã xác minh,
  - rủi ro còn lại nếu có.
- `NÊN` ưu tiên bằng chứng thay vì phát biểu cảm tính hoặc đoán định không kiểm chứng.

## 8. Quản lý ngoại lệ

- `BẮT BUỘC` bất kỳ trường hợp nào muốn lệch khỏi bộ rule này đều phải có bản ghi ngoại lệ gồm:
  - mục nào được miễn trừ,
  - lý do,
  - phạm vi ảnh hưởng,
  - rủi ro chấp nhận,
  - người chấp thuận,
  - thời hạn hết hiệu lực.
- `BẮT BUỘC` ngoại lệ là tạm thời, không biến thành mặc định mới nếu chưa được chuẩn hóa lại.

## 9. Definition of Done

Một công việc được xem là hoàn thành chỉ khi đáp ứng đủ tất cả điều kiện sau:

- Yêu cầu và tiêu chí chấp nhận đã được đáp ứng.
- Giải pháp đã được kiểm chứng bằng cách phù hợp.
- Rủi ro chính đã được nêu rõ và xử lý hợp lý.
- Tài liệu liên quan đã được cập nhật bằng tiếng Việt.
- Không còn lỗi nghiêm trọng, lỗ hổng nghiêm trọng, hoặc regression rõ ràng chưa được ghi nhận.
- Nếu liên quan release/production: đã có rollback plan và điểm theo dõi sau release.

## 10. Rule ưu tiên khi xung đột

Thứ tự ưu tiên khi có xung đột trong quá trình thực thi:

1. Bảo mật, an toàn dữ liệu, và tính đúng của hệ thống.
2. Tiêu chí chấp nhận và mục tiêu kinh doanh đã được xác nhận.
3. Tính dễ hiểu, dễ bảo trì, dễ vận hành.
4. Tốc độ thực thi.

Nếu cần đánh đổi, phải nói rõ đánh đổi đó và lý do chấp nhận.

## 11. Mô hình làm việc đa vai trò cho AI Agent

- `BẮT BUỘC` với task từ mức trung bình trở lên, agent phải mô phỏng tối thiểu các góc nhìn: Developer (triển khai), Reviewer (correctness/security), Tech Lead (kiến trúc/trade-off), Delivery Manager (phạm vi/rủi ro/kế hoạch phát hành).
- `BẮT BUỘC` báo cáo kết quả phải thể hiện được dấu vết quyết định của các vai trò trên: tại sao chọn phương án, rủi ro còn lại, cách kiểm chứng, và cách rollback.
- `BẮT BUỘC` trước khi kết thúc task, agent phải tự đối chiếu `Definition of Done` và quality gates bắt buộc (lint, type-check, test, build hoặc kiểm chứng thay thế có ghi nhận).
- `NÊN` kích hoạt góc nhìn Security Champion khi thay đổi liên quan external input, auth, secret, file upload, integration ngoài, hoặc boundary nhạy cảm.

## 12. Quy tắc phân rã và điều phối Subagent (khi nền tảng hỗ trợ)

- `BẮT BUỘC` nếu bài toán có thể tách thành workstream độc lập, agent phải phân rã task và điều phối song song bằng subagent để giảm thời gian và tăng độ bao phủ kiểm chứng.
- `BẮT BUỘC` mỗi subtask giao cho subagent phải có: mục tiêu, phạm vi file/module, đầu ra kỳ vọng, tiêu chí chấp nhận, và ràng buộc không được vi phạm.
- `BẮT BUỘC` luôn có bước integration sau khi subagent hoàn thành: hợp nhất kết quả, xử lý xung đột, kiểm tra nhất quán kiến trúc, rồi chạy lại quality gates toàn cục.
- `BẮT BUỘC` không giao subagent thực hiện thay đổi có side effect production cao khi chưa có rollback plan rõ ràng.
- `NÊN` ưu tiên mô hình phân rã theo vai trò: Discovery/Research, Implementation, Independent Review, Verification.
- `CÓ THỂ` dùng bảng RACI (Responsible, Accountable, Consulted, Informed) cho các thay đổi lớn nhiều module.
