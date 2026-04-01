import { Pencil, Plus, Trash2 } from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";
import { formatVnd } from "@/lib/currency";
import type { ShoeDetail } from "@/lib/types";

type AdminProductsPanelProps = {
  shoes: ShoeDetail[];
  onCreate: () => void;
  onEdit: (shoe: ShoeDetail) => void;
  onDelete: (shoeId: number) => void;
};

export function AdminProductsPanel({ shoes, onCreate, onEdit, onDelete }: AdminProductsPanelProps) {
  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Sản phẩm"
        description="Quản lý tên mẫu, thương hiệu, giá bán, tồn kho theo size và các nhãn hiển thị trên storefront."
        action={
          <Button type="button" onClick={onCreate} className="min-w-44">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        }
      />
      <AdminPanelBody className="space-y-4">
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/48 p-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Nhãn</TableHead>
                  <TableHead className="text-right">Tác vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shoes.map((shoe) => (
                  <TableRow key={shoe.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-[var(--foreground-hero)]">{shoe.name}</div>
                        <div className="text-sm text-[var(--foreground-dim)]">
                          {shoe.brand} • {shoe.silhouette}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{shoe.categoryName}</TableCell>
                    <TableCell>{formatVnd(shoe.price)}</TableCell>
                    <TableCell>{shoe.totalStock}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {shoe.featured ? <Badge>Nổi bật</Badge> : null}
                        {shoe.newArrival ? <Badge variant="secondary">Mới về</Badge> : null}
                        {shoe.bestSeller ? <Badge variant="success">Bán chạy</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => onEdit(shoe)}>
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="rounded-full"
                          onClick={() => onDelete(shoe.id)}
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
