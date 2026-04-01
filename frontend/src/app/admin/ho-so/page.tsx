"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@/components/icons";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AdminForbiddenState,
  AdminLoadingState,
  AdminLoginRequiredState,
} from "@/features/admin/admin-access-state";
import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";

const adminProfileSchema = z.object({
  fullName: z.string().min(2, "Họ tên quá ngắn."),
  phone: z.string().min(9, "Số điện thoại không hợp lệ."),
});

const adminPasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Mật khẩu hiện tại không hợp lệ."),
    newPassword: z.string().min(8, "Mật khẩu mới phải từ 8 ký tự."),
    confirmPassword: z.string().min(8, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type AdminProfileValues = z.infer<typeof adminProfileSchema>;
type AdminPasswordValues = z.infer<typeof adminPasswordSchema>;

export default function AdminProfilePage() {
  const {
    isReady,
    isAuthenticated,
    isAdmin,
    user,
    updateProfileAction,
    changePasswordAction,
  } = useAuth();
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const profileForm = useForm<AdminProfileValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
    },
  });

  const passwordForm = useForm<AdminPasswordValues>({
    resolver: zodResolver(adminPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      fullName: user.fullName,
      phone: user.phone,
    });
  }, [profileForm, user]);

  function submitProfile(values: AdminProfileValues) {
    setIsProfileSaving(true);
    void updateProfileAction(values)
      .then((updatedUser) => {
        profileForm.reset({
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
        });
        toast.success("Đã cập nhật hồ sơ quản trị.");
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Không thể cập nhật hồ sơ quản trị.");
      })
      .finally(() => {
        setIsProfileSaving(false);
      });
  }

  function submitPassword(values: AdminPasswordValues) {
    setIsPasswordSaving(true);
    void changePasswordAction({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
      .then(() => {
        passwordForm.reset();
        toast.success("Đã cập nhật bảo mật quản trị.");
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Không thể cập nhật mật khẩu quản trị.");
      })
      .finally(() => {
        setIsPasswordSaving(false);
      });
  }

  if (!isReady) return <AdminLoadingState />;
  if (!isAuthenticated) return <AdminLoginRequiredState />;
  if (!isAdmin) return <AdminForbiddenState />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="utility-label">Admin profile</div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] text-[var(--foreground-hero)]">
            Hồ sơ và bảo mật quản trị
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Đây là page riêng cho thông tin quản trị viên. Nó tách khỏi bảng điều khiển vận hành để vai trò và chức năng không bị nhập nhằng.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/admin">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Quay lại bảng quản trị
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader
            title="Hồ sơ quản trị"
            description="Chỉnh sửa thông tin quản trị viên mà không trộn với dữ liệu buyer account."
          />
          <AdminPanelBody>
            <form className="grid gap-4 md:max-w-xl" onSubmit={profileForm.handleSubmit(submitProfile)}>
              <div className="space-y-2">
                <Label htmlFor="admin-full-name">Họ và tên</Label>
                <Input id="admin-full-name" {...profileForm.register("fullName")} />
                {profileForm.formState.errors.fullName ? (
                  <div className="text-sm text-rose-500">{profileForm.formState.errors.fullName.message}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-phone">Số điện thoại</Label>
                <Input id="admin-phone" {...profileForm.register("phone")} />
                {profileForm.formState.errors.phone ? (
                  <div className="text-sm text-rose-500">{profileForm.formState.errors.phone.message}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" value={user?.email ?? ""} disabled />
              </div>
              <div className="flex justify-start">
                <Button type="submit" disabled={isProfileSaving}>
                  {isProfileSaving ? "Đang lưu hồ sơ..." : "Lưu hồ sơ quản trị"}
                </Button>
              </div>
            </form>
          </AdminPanelBody>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            title="Bảo mật quản trị"
            description="Đổi mật khẩu và siết lớp bảo mật của tài khoản quản trị ở page riêng."
          />
          <AdminPanelBody>
            <form className="grid gap-4 md:max-w-xl" onSubmit={passwordForm.handleSubmit(submitPassword)}>
              <div className="space-y-2">
                <Label htmlFor="admin-current-password">Mật khẩu hiện tại</Label>
                <Input id="admin-current-password" type="password" {...passwordForm.register("currentPassword")} />
                {passwordForm.formState.errors.currentPassword ? (
                  <div className="text-sm text-rose-500">{passwordForm.formState.errors.currentPassword.message}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-new-password">Mật khẩu mới</Label>
                <Input id="admin-new-password" type="password" {...passwordForm.register("newPassword")} />
                {passwordForm.formState.errors.newPassword ? (
                  <div className="text-sm text-rose-500">{passwordForm.formState.errors.newPassword.message}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-confirm-password">Nhập lại mật khẩu mới</Label>
                <Input id="admin-confirm-password" type="password" {...passwordForm.register("confirmPassword")} />
                {passwordForm.formState.errors.confirmPassword ? (
                  <div className="text-sm text-rose-500">{passwordForm.formState.errors.confirmPassword.message}</div>
                ) : null}
              </div>
              <div className="flex justify-start">
                <Button type="submit" disabled={isPasswordSaving}>
                  {isPasswordSaving ? "Đang cập nhật bảo mật..." : "Lưu thay đổi bảo mật"}
                </Button>
              </div>
            </form>
          </AdminPanelBody>
        </AdminPanel>
      </div>
    </div>
  );
}
