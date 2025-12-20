"use client"
import securityAxios from "@/axios-instances/SecurityAxios";
import {
  Card,
  // CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { endpoints } from "@/constants/endpoints/endpoints";
import { AlertMessage } from "@/widgets/alert-message/AlertMessage";
import AnalyticsLoader from "@/widgets/loaders/AnalyticsLoader";
import { useQuery } from "@tanstack/react-query";


function page() {
  return (
    <div className="space-y-6">
      <SectionCards />
      {/* <ChartAreaInteractive /> */}
    </div>
  );
}

export default page;

export const getCardAnalytics = async () => {
  const response = await securityAxios.get(endpoints.users.listUsersCardAnalytics);
  return response.data; // Return the actual data
};


function SectionCards() {

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [endpoints.users.listUsersCardAnalytics], // Unique cache key
    queryFn: getCardAnalytics, // Your Axios fetch function
    // staleTime: 60 * 1000, // Data stays fresh for 1 minute
  });
  
  
  if (isLoading || isFetching) return  <AnalyticsLoader/>;
  
  if (isError) return (
    <AlertMessage variant="error" message={`${error?.message || "Failed to load analytics"}`} />
  )
    

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {data?.data?.map((item:any)=> <Card key={item?.id} className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{item?.name}</CardDescription>
          <CardTitle className={`@[250px]/card:text-3xl ${item?.critical?"text-destructive":"text-green-700"} text-2xl font-semibold tabular-nums`}>
            {item?.value}
            <span className="text-sm px-2 text-gray-700">{item?.unit}</span>
          </CardTitle>
         
        </CardHeader>
        
      </Card>)}
     
    </div>
  );
}
