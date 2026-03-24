"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleUserRound, Eye, Handbag, KeyRound, Package } from "@/components/icons";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/components/auth-provider";
import { OrderDetailDialog } from "@/components/order-detail-dialog";
import { OrderStatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyOrder, listMyOrders } from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import { formatDateTime, initials } from "@/lib/presentation";
import type { OrderDetail, OrderResponse } from "@/lib/types";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên quá ngắn."),
  phone: z.string().min(9, "Số điện thoại không hợp lệ."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, "Mật khẩu hiện tại không hợp lệ."),
    newPassword: z.string().min(8, "Mật khẩu mới phải từ 8 ký tự."),
    confirmPassword: z.string().min(8, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const {
    isReady,
    isAuthenticated,
    user,
    getAccessToken,
    reloadUser,
    updateProfileAction,
    changePasswordAction,
  } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const token = await getAccessToken();
          if (!token) return;

          const [currentUser, orderList] = await Promise.all([reloadUser(), listMyOrders(token)]);
          if (currentUser) {
            profileForm.reset({
              fullName: currentUser.fullName,
              phone: currentUser.phone,
            });
          }
          setOrders(orderList);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu tài khoản.");
        } finally {
          setIsLoading(false);
        }
      })();
    });
  }, [getAccessToken, isAuthenticated, isReady, profileForm, reloadUser]);

  async function openOrderDetail(orderId: number) {
    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn.");
        return;
      }
      const detail = await getMyOrder(token, orderId);
      setSelectedOrder(detail);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết đơn.");
    }
  }

  function submitProfile(values: ProfileValues) {
    startTransition(() => {
      void updateProfileAction(values)
        .then((updatedUser) => {
          profileForm.reset({
            fullName: updatedUser.fullName,
            phone: updatedUser.phone,
          });
          toast.success("Đã cập nhật thông tin cá nhân.");
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Không thể cập nhật hồ sơ.");
        });
    });
  }

  function submitPassword(values: PasswordValues) {
    startTransition(() => {
      void changePasswordAction({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
        .then(() => {
          passwordForm.reset();
          toast.success("Đã đổi mật khẩu thành công.");
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Không thể đổi mật khẩu.");
        });
    });
  }

  if (!isReady || isLoading) {
    return (
      <div className="section-shell flex py-24">
        <div className="mx-auto flex items-center gap-3 text-[var(--muted)]">
          <span className="font-display italic text-white/80">ZEPHYR</span>
          <span>đang mở lounge tài khoản...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="section-shell py-20">
        <Card className="glass-strong brand-shell mx-auto max-w-4xl text-center">
          <CardHeader>
            <CardTitle>Bạn cần đăng nhập để mở khu tài khoản</CardTitle>
            <CardDescription>
              Sau khi đăng nhập, anh có thể cập nhật hồ sơ, theo dõi đơn hàng và quay lại mua tiếp mà không bắt đầu từ đầu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/dang-nhap?redirect=/tai-khoan">Đăng nhập</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dang-ky">Đăng ký</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="section-shell py-14">
      <div className="mb-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="glass-strong brand-shell overflow-hidden">
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="editorial-kicker">khu tài khoản</div>
              <CardTitle>{user.fullName}</CardTitle>
              <CardDescription>
                {user.email} • {user.phone}
              </CardDescription>
              <Badge variant="secondary">Vai trò: {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4 border-t border-white/8 pt-5">
            <BrandMark compact />
            <div className="text-right text-sm text-[var(--muted)]">
              Mọi đơn hàng, thông tin cá nhân và bảo mật đều được gom vào một nơi.
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổng đơn hàng</CardDescription>
              <CardTitle>{orders.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Đơn đang xử lý</CardDescription>
              <CardTitle>
                {orders.filter((order) => order.status !== "DELIVERED" && order.status !== "CANCELLED").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Giá trị đã đặt</CardDescription>
              <CardTitle>{formatVnd(totalSpent)}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">
            <Handbag />
            Đơn hàng
          </TabsTrigger>
          <TabsTrigger value="profile">
            <CircleUserRound />
            Hồ sơ
          </TabsTrigger>
          <TabsTrigger value="password">
            <KeyRound />
            Mật khẩu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="brand-shell">
            <CardHeader>
              <CardTitle>Lịch sử mua hàng</CardTitle>
              <CardDescription>Theo dõi trạng thái và xem chi tiết từng đơn đã đặt.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="surface-panel-muted rounded-[1.5rem] p-6 text-center text-[var(--muted)]">
                  <Package className="mx-auto mb-3 text-[var(--foreground-dim)]" size={40} />
                  Bạn chưa có đơn hàng nào. Hãy mở catalog và đặt đơn đầu tiên.
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/catalog">Mở catalog</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead className="text-right">Tác vụ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderCode}</TableCell>
                          <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>{formatVnd(order.totalAmount)}</TableCell>
                          <TableCell className="text-right">
                            <Button type="button" size="sm" variant="secondary" onClick={() => void openOrderDetail(order.id)}>
                              <Eye />
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="brand-shell">
            <CardHeader>
              <CardTitle>Cập nhật thông tin</CardTitle>
              <CardDescription>Thông tin này sẽ được điền sẵn trong thanh toán ở những lần mua sau.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:max-w-xl" onSubmit={profileForm.handleSubmit(submitProfile)}>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input id="fullName" {...profileForm.register("fullName")} />
                  {profileForm.formState.errors.fullName ? (
                    <div className="text-sm text-rose-200">{profileForm.formState.errors.fullName.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" {...profileForm.register("phone")} />
                  {profileForm.formState.errors.phone ? (
                    <div className="text-sm text-rose-200">{profileForm.formState.errors.phone.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email} disabled />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Đang cập nhật..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="brand-shell">
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Sử dụng mật khẩu mạnh hơn để đảm bảo an toàn cho tài khoản.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:max-w-xl" onSubmit={passwordForm.handleSubmit(submitPassword)}>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
                  {passwordForm.formState.errors.currentPassword ? (
                    <div className="text-sm text-rose-200">{passwordForm.formState.errors.currentPassword.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                  {passwordForm.formState.errors.newPassword ? (
                    <div className="text-sm text-rose-200">{passwordForm.formState.errors.newPassword.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
                  {passwordForm.formState.errors.confirmPassword ? (
                    <div className="text-sm text-rose-200">{passwordForm.formState.errors.confirmPassword.message}</div>
                  ) : null}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Đang đổi mật khẩu..." : "Cập nhật mật khẩu"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OrderDetailDialog open={isDetailOpen} onOpenChange={setIsDetailOpen} order={selectedOrder} />
    </div>
  );
}
