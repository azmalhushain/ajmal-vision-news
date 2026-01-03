import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Type,
  Image,
  Square,
  Columns,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Eye,
  Save,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  GripVertical,
} from "lucide-react";

interface EmailBlock {
  id: string;
  type: "text" | "image" | "button" | "divider" | "spacer" | "columns";
  content: Record<string, string>;
  styles: Record<string, string>;
}

interface EmailTemplate {
  name: string;
  subject: string;
  blocks: EmailBlock[];
  styles: {
    backgroundColor: string;
    fontFamily: string;
    primaryColor: string;
  };
}

const defaultBlocks: { type: EmailBlock["type"]; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Text Block", icon: <Type className="h-4 w-4" /> },
  { type: "image", label: "Image", icon: <Image className="h-4 w-4" /> },
  { type: "button", label: "Button", icon: <Square className="h-4 w-4" /> },
  { type: "divider", label: "Divider", icon: <Columns className="h-4 w-4 rotate-90" /> },
  { type: "spacer", label: "Spacer", icon: <Square className="h-4 w-4 opacity-50" /> },
];

const fontFamilies = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Verdana, sans-serif", label: "Verdana" },
];

interface EmailTemplateBuilderProps {
  onSave?: (template: EmailTemplate) => void;
  initialTemplate?: EmailTemplate;
}

export const EmailTemplateBuilder = ({ onSave, initialTemplate }: EmailTemplateBuilderProps) => {
  const [template, setTemplate] = useState<EmailTemplate>(
    initialTemplate || {
      name: "New Template",
      subject: "Newsletter Subject",
      blocks: [
        {
          id: "header-1",
          type: "text",
          content: { text: "<h1>Welcome to Our Newsletter!</h1>" },
          styles: { textAlign: "center", fontSize: "24px", color: "#333333" },
        },
      ],
      styles: {
        backgroundColor: "#f4f4f4",
        fontFamily: "Arial, sans-serif",
        primaryColor: "#4F46E5",
      },
    }
  );
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"design" | "preview" | "code">("design");
  const { toast } = useToast();

  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };
    setTemplate((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
    setSelectedBlock(newBlock.id);
  };

  const getDefaultContent = (type: EmailBlock["type"]): Record<string, string> => {
    switch (type) {
      case "text":
        return { text: "Your text here..." };
      case "image":
        return { src: "https://via.placeholder.com/600x200", alt: "Image" };
      case "button":
        return { text: "Click Here", href: "#" };
      case "divider":
        return { height: "1" };
      case "spacer":
        return { height: "20" };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: EmailBlock["type"]): Record<string, string> => {
    switch (type) {
      case "text":
        return { textAlign: "left", fontSize: "16px", color: "#333333", padding: "10px" };
      case "image":
        return { width: "100%", borderRadius: "8px" };
      case "button":
        return {
          backgroundColor: template.styles.primaryColor,
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          textAlign: "center",
        };
      case "divider":
        return { borderColor: "#e5e5e5" };
      case "spacer":
        return {};
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, updates: Partial<EmailBlock>) => {
    setTemplate((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    }));
  };

  const deleteBlock = (blockId: string) => {
    setTemplate((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== blockId),
    }));
    setSelectedBlock(null);
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    setTemplate((prev) => {
      const index = prev.blocks.findIndex((b) => b.id === blockId);
      if ((direction === "up" && index === 0) || (direction === "down" && index === prev.blocks.length - 1)) {
        return prev;
      }
      const newBlocks = [...prev.blocks];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      return { ...prev, blocks: newBlocks };
    });
  };

  const generateHtml = useCallback(() => {
    const { blocks, styles } = template;
    
    const blocksHtml = blocks.map((block) => {
      switch (block.type) {
        case "text":
          return `<div style="padding: ${block.styles.padding || '10px'}; text-align: ${block.styles.textAlign || 'left'}; font-size: ${block.styles.fontSize || '16px'}; color: ${block.styles.color || '#333333'};">${block.content.text}</div>`;
        case "image":
          return `<div style="text-align: center; padding: 10px;"><img src="${block.content.src}" alt="${block.content.alt}" style="max-width: 100%; width: ${block.styles.width || '100%'}; border-radius: ${block.styles.borderRadius || '0'};"/></div>`;
        case "button":
          return `<div style="text-align: ${block.styles.textAlign || 'center'}; padding: 20px;"><a href="${block.content.href}" style="display: inline-block; background-color: ${block.styles.backgroundColor || styles.primaryColor}; color: ${block.styles.color || '#ffffff'}; padding: ${block.styles.padding || '12px 24px'}; border-radius: ${block.styles.borderRadius || '6px'}; text-decoration: none; font-weight: bold;">${block.content.text}</a></div>`;
        case "divider":
          return `<hr style="border: none; border-top: ${block.content.height || '1'}px solid ${block.styles.borderColor || '#e5e5e5'}; margin: 20px 0;"/>`;
        case "spacer":
          return `<div style="height: ${block.content.height || '20'}px;"></div>`;
        default:
          return "";
      }
    }).join("");

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${styles.backgroundColor}; font-family: ${styles.fontFamily};">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
    ${blocksHtml}
  </div>
</body>
</html>`;
  }, [template]);

  const handleSave = () => {
    if (onSave) {
      onSave(template);
    }
    toast({ title: "Template saved!", description: "Your email template has been saved." });
  };

  const renderBlockEditor = (block: EmailBlock) => {
    return (
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        {block.type === "text" && (
          <>
            <div>
              <Label>Text Content (HTML supported)</Label>
              <Textarea
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, { content: { ...block.content, text: e.target.value } })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={block.styles.textAlign === "left" ? "default" : "outline"}
                size="sm"
                onClick={() => updateBlock(block.id, { styles: { ...block.styles, textAlign: "left" } })}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={block.styles.textAlign === "center" ? "default" : "outline"}
                size="sm"
                onClick={() => updateBlock(block.id, { styles: { ...block.styles, textAlign: "center" } })}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={block.styles.textAlign === "right" ? "default" : "outline"}
                size="sm"
                onClick={() => updateBlock(block.id, { styles: { ...block.styles, textAlign: "right" } })}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Font Size</Label>
                <Input
                  value={block.styles.fontSize}
                  onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, fontSize: e.target.value } })}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={block.styles.color}
                    onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, color: e.target.value } })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={block.styles.color}
                    onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, color: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {block.type === "image" && (
          <>
            <div>
              <Label>Image URL</Label>
              <Input
                value={block.content.src}
                onChange={(e) => updateBlock(block.id, { content: { ...block.content, src: e.target.value } })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                value={block.content.alt}
                onChange={(e) => updateBlock(block.id, { content: { ...block.content, alt: e.target.value } })}
              />
            </div>
            <div>
              <Label>Border Radius</Label>
              <Input
                value={block.styles.borderRadius}
                onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, borderRadius: e.target.value } })}
              />
            </div>
          </>
        )}

        {block.type === "button" && (
          <>
            <div>
              <Label>Button Text</Label>
              <Input
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, { content: { ...block.content, text: e.target.value } })}
              />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input
                value={block.content.href}
                onChange={(e) => updateBlock(block.id, { content: { ...block.content, href: e.target.value } })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={block.styles.backgroundColor}
                    onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, backgroundColor: e.target.value } })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={block.styles.backgroundColor}
                    onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, backgroundColor: e.target.value } })}
                  />
                </div>
              </div>
              <div>
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={block.styles.color}
                    onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, color: e.target.value } })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={block.styles.color}
                    onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, color: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {(block.type === "divider" || block.type === "spacer") && (
          <div>
            <Label>Height (px)</Label>
            <Input
              type="number"
              value={block.content.height}
              onChange={(e) => updateBlock(block.id, { content: { ...block.content, height: e.target.value } })}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Template Builder</h2>
          <p className="text-muted-foreground">Drag and drop to create professional emails</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab("preview")}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Add Blocks */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Blocks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {defaultBlocks.map((block) => (
              <Button
                key={block.type}
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock(block.type)}
              >
                {block.icon}
                <span className="ml-2">{block.label}</span>
              </Button>
            ))}
          </CardContent>

          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Global Styles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={template.name}
                onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Subject Line</Label>
              <Input
                value={template.subject}
                onChange={(e) => setTemplate((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label>Font Family</Label>
              <Select
                value={template.styles.fontFamily}
                onValueChange={(value) =>
                  setTemplate((prev) => ({ ...prev, styles: { ...prev.styles, fontFamily: value } }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={template.styles.primaryColor}
                  onChange={(e) =>
                    setTemplate((prev) => ({ ...prev, styles: { ...prev.styles, primaryColor: e.target.value } }))
                  }
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={template.styles.primaryColor}
                  onChange={(e) =>
                    setTemplate((prev) => ({ ...prev, styles: { ...prev.styles, primaryColor: e.target.value } }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={template.styles.backgroundColor}
                  onChange={(e) =>
                    setTemplate((prev) => ({ ...prev, styles: { ...prev.styles, backgroundColor: e.target.value } }))
                  }
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={template.styles.backgroundColor}
                  onChange={(e) =>
                    setTemplate((prev) => ({ ...prev, styles: { ...prev.styles, backgroundColor: e.target.value } }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">HTML Code</TabsTrigger>
            </TabsList>

            <TabsContent value="design">
              <Card>
                <CardContent className="p-6">
                  <div
                    className="min-h-[500px] rounded-lg p-4"
                    style={{ backgroundColor: template.styles.backgroundColor }}
                  >
                    <div className="max-w-[600px] mx-auto bg-white rounded-lg shadow-sm p-4 space-y-2">
                      {template.blocks.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                          <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Add blocks from the sidebar to start building your email</p>
                        </div>
                      ) : (
                        template.blocks.map((block, index) => (
                          <motion.div
                            key={block.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative group border-2 rounded-lg transition-colors ${
                              selectedBlock === block.id
                                ? "border-primary"
                                : "border-transparent hover:border-primary/30"
                            }`}
                            onClick={() => setSelectedBlock(block.id)}
                          >
                            {/* Block Controls */}
                            <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(block.id, "up");
                                }}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <GripVertical className="h-4 w-4 mx-auto text-muted-foreground" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveBlock(block.id, "down");
                                }}
                                disabled={index === template.blocks.length - 1}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBlock(block.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Block Preview */}
                            <div className="p-2" style={{ fontFamily: template.styles.fontFamily }}>
                              {block.type === "text" && (
                                <div
                                  style={{
                                    textAlign: block.styles.textAlign as "left" | "center" | "right",
                                    fontSize: block.styles.fontSize,
                                    color: block.styles.color,
                                  }}
                                  dangerouslySetInnerHTML={{ __html: block.content.text }}
                                />
                              )}
                              {block.type === "image" && (
                                <div className="text-center">
                                  <img
                                    src={block.content.src}
                                    alt={block.content.alt}
                                    className="max-w-full mx-auto"
                                    style={{ borderRadius: block.styles.borderRadius }}
                                  />
                                </div>
                              )}
                              {block.type === "button" && (
                                <div style={{ textAlign: (block.styles.textAlign as "left" | "center" | "right") || "center" }}>
                                  <span
                                    className="inline-block cursor-pointer"
                                    style={{
                                      backgroundColor: block.styles.backgroundColor,
                                      color: block.styles.color,
                                      padding: block.styles.padding,
                                      borderRadius: block.styles.borderRadius,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {block.content.text}
                                  </span>
                                </div>
                              )}
                              {block.type === "divider" && (
                                <hr
                                  style={{
                                    borderColor: block.styles.borderColor,
                                    borderWidth: `${block.content.height}px`,
                                  }}
                                />
                              )}
                              {block.type === "spacer" && (
                                <div style={{ height: `${block.content.height}px` }} />
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Block Editor Panel */}
                  {selectedBlock && (
                    <div className="mt-6 border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Edit Block</h3>
                        <Badge variant="outline">
                          {template.blocks.find((b) => b.id === selectedBlock)?.type}
                        </Badge>
                      </div>
                      {renderBlockEditor(template.blocks.find((b) => b.id === selectedBlock)!)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Email Preview</CardTitle>
                  <CardDescription>Subject: {template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={generateHtml()}
                      className="w-full h-[600px]"
                      title="Email Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code">
              <Card>
                <CardHeader>
                  <CardTitle>HTML Code</CardTitle>
                  <CardDescription>Copy this HTML to use in your email campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generateHtml()}
                    readOnly
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <Button
                    className="mt-4"
                    onClick={() => {
                      navigator.clipboard.writeText(generateHtml());
                      toast({ title: "Copied!", description: "HTML copied to clipboard" });
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
