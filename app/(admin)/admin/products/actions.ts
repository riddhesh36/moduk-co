"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addProduct(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const slug = formData.get("slug") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const ingredientsStr = formData.get("ingredients") as string;
  const ingredients = ingredientsStr.split(",").map((s) => s.trim()).filter(Boolean);
  const price = Number(formData.get("price"));
  const pieces = Number(formData.get("pieces"));
  const shelf_life = formData.get("shelf_life") as string || "Best within 24 hours";
  const storage_instructions = formData.get("storage_instructions") as string || "Refrigerate if not consuming same day";
  const badge = formData.get("badge") as string || null;
  const is_active = formData.get("is_active") === "true";

  let image_url = formData.get("image_url") as string;
  const imageFile = formData.get("image_file") as File;

  // Upload image if provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${slug}-${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('products')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return { success: false, error: "Failed to upload image" };
    }

    const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
    image_url = publicUrlData.publicUrl;
  }

  const { error } = await supabase
    .from('products')
    .insert([{
      id: slug,
      slug,
      name,
      description,
      ingredients,
      price,
      pieces,
      image_url,
      shelf_life,
      storage_instructions,
      badge,
      is_active
    }]);

  if (error) {
    console.error("Error adding product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  revalidatePath('/');
  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const ingredientsStr = formData.get("ingredients") as string;
  const ingredients = ingredientsStr.split(",").map((s) => s.trim()).filter(Boolean);
  const price = Number(formData.get("price"));
  const pieces = Number(formData.get("pieces"));
  const shelf_life = formData.get("shelf_life") as string || "Best within 24 hours";
  const storage_instructions = formData.get("storage_instructions") as string || "Refrigerate if not consuming same day";
  const badge = formData.get("badge") as string || null;
  const is_active = formData.get("is_active") === "true";

  let image_url = formData.get("image_url") as string;
  const imageFile = formData.get("image_file") as File;

  // Upload image if provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('products')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
      image_url = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description,
      ingredients,
      price,
      pieces,
      image_url,
      shelf_life,
      storage_instructions,
      badge,
      is_active
    })
    .eq('id', id);

  if (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  revalidatePath(`/shop/${id}`);
  revalidatePath('/');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  revalidatePath('/');
  return { success: true };
}
