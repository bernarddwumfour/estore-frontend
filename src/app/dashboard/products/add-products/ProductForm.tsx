"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { selectField, CustomSelect } from "@/widgets/custom-select/CustomSelect";

// Minimal schema — only for controlled fields
const formSchema = z.object({
  name: z.string().min(2, { message: "Product name is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  sku: z.string().min(3, { message: "SKU is required" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  compareAtPrice: z.coerce.number().optional(),
  stockQuantity: z.coerce.number().int().min(0, { message: "Stock cannot be negative" }),
  isPublished: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

export default function ProductCreationForm() {
  const [selectedCategory, setSelectedCategory] = useState<selectField | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      compareAtPrice: undefined,
      stockQuantity: 0,
      isPublished: true,
    },
  });

  // Mock categories — replace with API fetch
  const categoryOptions: selectField[] = [
    { id: 1, label: "Electronics", value: "electronics" },
    { id: 2, label: "Fashion", value: "fashion" },
    { id: 3, label: "Cars", value: "cars" },
    { id: 4, label: "Car Parts", value: "car_parts" },
    { id: 5, label: "Home & Garden", value: "home_garden" },
  ];

  const addTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const addImage = () => {
    if (imageInput.trim() && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(imageInput.trim())) {
      setImageUrls([...imageUrls, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  const updateAttribute = (index: number, field: "key" | "value", value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    if (imageUrls.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    const attributesObject = attributes.reduce((acc, attr) => {
      if (attr.key.trim()) acc[attr.key.trim()] = attr.value.trim();
      return acc;
    }, {} as Record<string, string>);

    const payload = {
      ...data,
      categoryId: selectedCategory.value,
      tags,
      imageUrls,
      attributes: attributesObject,
    };

    // try {
    //   const response = await securityAxios.post(endpoints.products.create, payload);
    //   if (response.status === 201 || response.status === 200) {
    //     toast.success("Product created successfully!");
    //     form.reset();
    //     setSelectedCategory(null);
    //     setTags([]);
    //     setImageUrls([]);
    //     setAttributes([{ key: "", value: "" }]);
    //   }
    // } catch (error: any) {
    //   toast.error(error?.response?.data?.error || "Failed to create product");
    // }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
        <h2 className="text-3xl font-bold text-gray-800">Add New Product</h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name *</FormLabel>
                <FormControl>
                  <Input placeholder="iPhone 15 Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU *</FormLabel>
                <FormControl>
                  <Input placeholder="IPH-15PRO-256-BLK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Detailed product description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="99.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="compareAtPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compare At Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="129.99" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormLabel>Category *</FormLabel>
            {/* <CustomSelect
              placeholder="Select Category"
              selectField={selectedCategory ? [selectedCategory] : []}
              setSelectField={(items) => setSelectedCategory(items[0] || null)}
              items={categoryOptions}
            /> */}
            {!selectedCategory && <p className="text-sm text-red-500 mt-1">Category is required</p>}
          </div>

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Publish Product</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Images */}
        <div>
          <FormLabel>Product Images * (Enter valid image URLs)</FormLabel>
          <div className="flex gap-2 mt-2">
            <Input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Button type="button" onClick={addImage} disabled={!imageInput.trim()}>
              Add <PlusCircle className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt={`Product ${i + 1}`} className="h-32 w-full object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {imageUrls.length === 0 && <p className="text-sm text-red-500 mt-2">At least one image is required</p>}
        </div>

        {/* Tags */}
        <div>
          <FormLabel>Tags</FormLabel>
          <div className="flex gap-2 mt-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="new, sale, featured" />
            <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
              Add Tag
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {tag}
                <button type="button" onClick={() => removeTag(i)} className="text-blue-600 hover:text-red-600">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Attributes */}
        <div>
          <FormLabel>Product Attributes (e.g., Color, Size, RAM)</FormLabel>
          <div className="space-y-3 mt-3">
            {attributes.map((attr, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  placeholder="Attribute name (e.g., Color)"
                  value={attr.key}
                  onChange={(e) => updateAttribute(i, "key", e.target.value)}
                />
                <Input
                  placeholder="Value (e.g., Black)"
                  value={attr.value}
                  onChange={(e) => updateAttribute(i, "value", e.target.value)}
                />
                {attributes.length > 1 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeAttribute(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addAttribute}>
              Add Attribute
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-8 border-t">
          <Button type="submit" size="lg" className="w-full md:w-auto">
            Create Product
          </Button>
        </div>
      </form>
    </Form>
  );
}