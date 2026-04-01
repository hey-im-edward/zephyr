import { Pencil, Plus, Trash2 } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";
import type { Category } from "@/lib/types";

type AdminCategoriesPanelProps = {
  categories: Category[];
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
};

export function AdminCategoriesPanel({
  categories,
  onCreate,
  onEdit,
  onDelete,
}: AdminCategoriesPanelProps) {
  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Danh mục"
        description="Quản lý nhóm sản phẩm, mô tả và hero tone để storefront giữ được nhịp màu nhất quán."
        action={
          <Button type="button" onClick={onCreate} className="min-w-44">
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </Button>
        }
      />
      <AdminPanelBody>
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/48 p-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Màu</TableHead>
                  <TableHead className="text-right">Tác vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium text-[var(--foreground-hero)]">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell className="max-w-md text-[var(--muted)]">{category.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-6 w-6 rounded-full border border-white/12"
                          style={{ backgroundColor: category.heroTone }}
                        />
                        <span>{category.heroTone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => onEdit(category)}>
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="rounded-full"
                          onClick={() => onDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminPanelBody>
    </AdminPanel>
  );
}
