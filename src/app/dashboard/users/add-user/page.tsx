import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import React from "react";
  import UserForm from "./UserForm";
  
  function page() {
    return (
      <Card className="max-w-[600px] w-full mx-auto">
        <CardHeader>
          <CardTitle>Add User</CardTitle>
          <CardDescription>Fill this form to add a new user.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>
    );
  }
  
  export default page;
  