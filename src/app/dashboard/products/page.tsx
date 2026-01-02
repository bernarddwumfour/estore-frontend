'use client'

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Info, MoreHorizontal, PlusCircle, Power, PowerOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { AlertMessage } from "@/widgets/alert-message/AlertMessage";
import DataTable from "@/widgets/data-table/DataTable";
import TableLoader from "@/widgets/loaders/TableLoader";
import { endpoints } from "@/constants/endpoints/endpoints";
import securityAxios from "@/axios-instances/SecurityAxios";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProductCreationForm from "./ProductForm";
import ProductVariantForm from "./ProductVariantForm";
import ProductDetailDisplay from "./ProductDetails";
import ProductDetailCard from "./ProductDetails";


export const fetchProducts = async () => {
  const response = await securityAxios.get(endpoints.products.listProducts);
  return response.data; // Return the actual data
};


function ListProducts() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [endpoints.products.listProducts], // Unique cache key
    queryFn: fetchProducts, // Your Axios fetch function
    // staleTime: 60 * 1000, // Data stays fresh for 1 minute
  });
  


  if (isLoading || isFetching) return <TableLoader />;

  if (isError) return (
    <AlertMessage variant="error" message={`${error?.message || "Failed to load products"}`} />
  )


  function ActionsDropdown({ row }: { row: any }) {
    const handleActivateUser = async () => {
      try {
        const response = await securityAxios.post(
          endpoints.users.activateOrDeactivate.replace(":id", row.id)
        );

        if (response.status !== 200) {
          throw new Error("Failed to activate user");
        }

        toast.success("User activated successfully");
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "User activation failed");
      }
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Dialog>
            <DialogTrigger className="w-full">
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent className="sm:max-w-6xl overflow-y-scroll w-full max-h-[95vh]">
              {/* <DialogTitle>Add New Variant For {row.title}</DialogTitle>
              <DialogDescription className="text-sm p-0">Fill this form to add a new variant for {row.title}.</DialogDescription> */}
              <ProductVariantForm productId={row.id} />
            </DialogContent>
          </Dialog>

          <DropdownMenuSeparator />
          <Dialog>
            <DialogTrigger className="w-full">
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <Info className="mr-2 h-4 w-4" /> Details
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[95vw] overflow-y-scroll w-full max-h-[95vh]">
              {/* <DialogTitle>Add New Variant For {row.title}</DialogTitle>
              <DialogDescription className="text-sm p-0">Fill this form to add a new variant for {row.title}.</DialogDescription> */}
              <ProductDetailCard productId={row.id as string}/>
            </DialogContent>
          </Dialog>


          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleActivateUser}>

            {row?.is_active ? <>
              <PowerOff className="mr-2 h-4 w-4" />Deactivate </>
              : <><Power className="mr-2 h-4 w-4" />Activate </>} User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (


    <div className="space-y-2">
      <Dialog>
        <DialogTrigger>
          <Button>
            New product <PlusCircle />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-3xl overflow-y-scroll w-full max-h-[95vh]">
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription className="text-sm p-0">Fill this form to add a new product.</DialogDescription>
          <ProductCreationForm />
        </DialogContent>
      </Dialog>

      <DataTable data={data.data.products} hiddenColumns={["id", "description", "features", "options", "slug"]} actionsDropdown={ActionsDropdown} badgesConfig={{
        is_featured: {
          values: ["Yes", "No"],
          variants: ["success", "destructive"],
        },
        is_bestseller: {
          values: ["Yes", "No"],
          variants: ["success", "destructive"],
        },
        has_stock: {
          values: ["Yes", "No"],
          variants: ["success", "destructive"],
        },
        is_new: {
          values: ["Yes", "No"],
          variants: ["info", "pink"],
        },
        status: {
          values: ["published", "archived", "draft"],
          variants: ["info", "red", "warning"],
        },

      }} />
    </div>
  );
}

export default ListProducts;
