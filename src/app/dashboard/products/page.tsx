'use client'

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Power, PowerOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { AlertMessage } from "@/widgets/alert-message/AlertMessage";
import DataTable from "@/widgets/data-table/DataTable";
import TableLoader from "@/widgets/loaders/TableLoader";
import { endpoints } from "@/constants/endpoints/endpoints";
import securityAxios from "@/axios-instances/SecurityAxios";


export const fetchUsers = async () => {
  const response = await securityAxios.get(endpoints.users.listUsers_Dashboard);
  return response.data; // Return the actual data
};


function ListUsers() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [endpoints.users.listUsers_Dashboard], // Unique cache key
    queryFn: fetchUsers, // Your Axios fetch function
    // staleTime: 60 * 1000, // Data stays fresh for 1 minute
  });


  if (isLoading || isFetching) return <TableLoader/>;

  if (isError) return (
    <AlertMessage variant="error" message={`${error?.message || "Failed to load users"}`} />
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
          <DropdownMenuItem onClick={handleActivateUser}>

            {row?.is_active ? <>
              <PowerOff className="mr-2 h-4 w-4" />"Deactivate" </>
              : <><Power className="mr-2 h-4 w-4" />"Activate" </>} User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (


    <div>
      <DataTable data={data.data} hiddenColumns={["id"]} actionsDropdown={ActionsDropdown} badgesConfig={{
    is_active: {
      values: ["Yes", "No"],
      variants: ["success", "destructive"], 
    },
    is_email_verified: {
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
   
  }} />
    </div>
  );
}

export default ListUsers;
