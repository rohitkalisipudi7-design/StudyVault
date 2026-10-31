'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EditResourceDialogProps {
  editingResource: any | null;
  onClose: () => void;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDesc: string;
  setEditDesc: (val: string) => void;
  editUrl: string;
  setEditUrl: (val: string) => void;
  onSave: (e: React.FormEvent) => void;
}

export function EditResourceDialog({
  editingResource,
  onClose,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  editUrl,
  setEditUrl,
  onSave,
}: EditResourceDialogProps) {
  if (!editingResource) return null;

  return (
    <Dialog open={Boolean(editingResource)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onEscapeKeyDown={onClose}
        className="max-w-md bg-[#FDFBF7] border border-[#b19681]/50 p-6 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-[#2D3822]">
            Edit Resource Details
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-serif font-bold text-[#2D3822]">Title</Label>
            <Input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              className="bg-white border-[#b19681]/50 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-serif font-bold text-[#2D3822]">Description</Label>
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={3}
              className="bg-white border-[#b19681]/50 text-xs resize-none"
            />
          </div>

          {editingResource.type === 'link' && (
            <div className="space-y-1">
              <Label className="text-xs font-serif font-bold text-[#2D3822]">URL</Label>
              <Input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                required
                className="bg-white border-[#b19681]/50 text-xs"
              />
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#b19681]/50 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2D3822] hover:bg-[#3D4D2F] text-white text-xs font-bold"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
