'use client'

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Power, PowerOff, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { AlertMessage } from "@/widgets/alert-message/AlertMessage";
import DataTable from "@/widgets/data-table/DataTable";
import TableLoader from "@/widgets/loaders/TableLoader";
import { endpoints } from "@/constants/endpoints/endpoints";
import securityAxios from "@/axios-instances/SecurityAxios";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CategoryCreationForm from "./CatergoryForm";


export const fetchCategories = async () => {
  const response = await securityAxios.get(endpoints.products.listcategories);
  return response.data; // Return the actual data
};


function ListCategories() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [endpoints.products.listcategories], // Unique cache key
    queryFn: fetchCategories, // Your Axios fetch function
    // staleTime: 60 * 1000, // Data stays fresh for 1 minute
  });


  if (isLoading || isFetching) return <TableLoader />;

  if (isError) return (
    <AlertMessage variant="error" message={`${error?.message || "Failed to load categories"}`} />
  )


  function ActionsDropdown({ row }: { row: any }) {
    const queryClient = useQueryClient()
    const handleDeleteCategory = async () => {
      try {
        const response = await securityAxios.delete(
          endpoints.products.deleteCategory.replace(":id", row.id)
        );

        if (response.status !== 200) {
          throw new Error("Failed to delete category");
        }



        toast.success(response?.data || "Category deleted successfully");

        queryClient.invalidateQueries({
          queryKey:[endpoints.products.listcategories],
          exact : false
        })
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Category deletion failed");
      }
    };

    const handleActivateDectivateCategory = async () => {
      try {
        const response = await securityAxios.patch(
          endpoints.products.updateCategory.replace(":id", row.id),{
            is_active:!row.is_active
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to delete category");
        }

        toast.success("category deleted successfully");
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Category deletion failed");
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
          <DropdownMenuItem onClick={handleActivateDectivateCategory}>

            {row?.is_active ? <>
              <PowerOff className="mr-2 h-4 w-4" />"Deactivate" </>
              : <><Power className="mr-2 h-4 w-4" />"Activate" </>} Category
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDeleteCategory}>

            <>
              <Trash className="mr-2 h-4 w-4" />Delete </>
            Category
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
            New category <PlusCircle />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[95vh] sm:max-w-lg overflow-y-scroll">
          <CategoryCreationForm />
        </DialogContent>
      </Dialog>

      <DataTable data={data.data.categories} hiddenColumns={["id", "parent_id"]} actionsDropdown={ActionsDropdown} badgesConfig={{
        is_active: {
          values: ["Yes", "No"],
          variants: ["success", "destructive"],
        },
        email_verified: {
          values: ["Yes", "No"],
          variants: ["success", "destructive"],
        },
        has_reset_password: {
          values: ["Yes", "No"],
          variants: ["success", "destructive"],
        },
        gender: {
          values: ["Male", "Female"],
          variants: ["info", "pink"],
        },

        role: {
          values: ["customer", "staff", "admin"],
          variants: ["info", "pink", "orange"],
        },
      }} />
    </div>
  );
}

export default ListCategories;
