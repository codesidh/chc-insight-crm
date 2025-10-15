'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Copy, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  GitBranch,
  Power,
  PowerOff,
  History
} from 'lucide-react';
import { FormTemplate } from '@/types';

interface TemplateManagementProps {
  template: FormTemplate;
  versions?: FormTemplate[];
  onEdit?: (template: FormTemplate) => void;
  onView?: (template: FormTemplate) => void;
  onCopy?: (template: FormTemplate, newName: string) => void;
  onToggleActive?: (template: FormTemplate) => void;
  onCreateVersion?: (template: FormTemplate) => void;
  onCompareVersions?: (template1: FormTemplate, template2: FormTemplate) => void;
}

export function TemplateManagement({
  template,
  versions = [],
  onEdit,
  onView,
  onCopy,
  onToggleActive,
  onCreateVersion,
  onCompareVersions
}: TemplateManagementProps) {
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [copyName, setCopyName] = useState(`${template.name} (Copy)`);
  const [copyDescription, setCopyDescription] = useState(template.description || '');

  const handleCopy = () => {
    if (copyName.trim()) {
      onCopy?.(template, copyName.trim());
      setIsCopyDialogOpen(false);
      setCopyName(`${template.name} (Copy)`);
      setCopyDescription(template.description || '');
    }
  };

  const handleCreateVersion = () => {
    onCreateVersion?.(template);
    setIsVersionDialogOpen(false);
  };

  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
  const latestVersion = sortedVersions[0];
  const isLatestVersion = template.version === latestVersion?.version;

  return (
    <div className="space-y-6">
      {/* Template Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <Badge variant="outline">v{template.version}</Badge>
                <Badge variant={template.isActive ? 'default' : 'secondary'}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {isLatestVersion && (
                  <Badge variant="destructive">Latest</Badge>
                )}
              </div>
              <CardDescription>{template.description}</CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Template Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onView?.(template)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(template)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsCopyDialogOpen(true)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsVersionDialogOpen(true)}>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Create New Version
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleActive?.(template)}>
                  {template.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Questions</div>
              <div className="font-medium">{template.questions?.length || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Required</div>
              <div className="font-medium">
                {template.questions?.filter(q => q.required).length || 0}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Effective Date</div>
              <div className="font-medium">
                {new Date(template.effectiveDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Created By</div>
              <div className="font-medium">{template.createdBy}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      {versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
            <CardDescription>
              All versions of this template ({versions.length} versions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedVersions.map((version) => (
                <div
                  key={version.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    version.id === template.id ? 'bg-primary/5 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{version.version}</Badge>
                      {version.id === template.id && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                      {version.version === latestVersion?.version && (
                        <Badge variant="destructive">Latest</Badge>
                      )}
                      <Badge variant={version.isActive ? 'default' : 'secondary'}>
                        {version.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{version.name}</div>
                      <div className="text-muted-foreground">
                        {new Date(version.effectiveDate).toLocaleDateString()} • {version.createdBy}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(version)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(version)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {version.id !== template.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCompareVersions?.(template, version)}
                      >
                        <GitBranch className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Copy Template Dialog */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Template</DialogTitle>
            <DialogDescription>
              Create a copy of &quot;{template.name}&quot; with a new name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="copy-name">Template Name</Label>
              <Input
                id="copy-name"
                value={copyName}
                onChange={(e) => setCopyName(e.target.value)}
                placeholder="Enter new template name..."
              />
            </div>
            <div>
              <Label htmlFor="copy-description">Description</Label>
              <Textarea
                id="copy-description"
                value={copyDescription}
                onChange={(e) => setCopyDescription(e.target.value)}
                placeholder="Enter template description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopy} disabled={!copyName.trim()}>
              <Copy className="h-4 w-4 mr-2" />
              Create Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Version Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version of &quot;{template.name}&quot; (v{template.version + 1})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">What happens when you create a new version?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• A copy of the current template will be created</li>
                <li>• The version number will be incremented to v{template.version + 1}</li>
                <li>• You can then edit the new version independently</li>
                <li>• The original version will remain unchanged</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion}>
              <GitBranch className="h-4 w-4 mr-2" />
              Create Version v{template.version + 1}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}