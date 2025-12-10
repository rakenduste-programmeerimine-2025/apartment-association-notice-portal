
# User & Community Management System

This project provides a web-based platform for managing residential communities.  
It supports user roles (Admin and Resident), community organization, announcements, and meeting management.

## Features

### 1. User Management
- User registration,login and update password  
- Role-based access control with two levels:
  - **Admin**
  - **Resident**


### 2. Community / Association Management
- **Resident**
  - Join an existing community  
- **Admin**
  - Approve or reject member requests  
  - Remove members  
  - Control access — only members can view their community content  


### 3. Admin Board Notices
- **Admin**
  - Create, read, and delete notices
  - Filter Notices
  - Pagination
  - Categories:
    - General Notices  
    - Maintenance & Repairs  
    - Safety  
- **Resident**
  - Filter Notices
  - Pagination
  - View notices  
  - React to notices with "Likes"


### 4. Resident Worries (Community Board)
- **Resident**
  - Create and read their own worries  
  - Worries are visible to all community members  
  - React to worries with "Likes"  
- **Admin**
  - Delete inappropriate worries

### 5. Meeting Management
- **Admin**
  - Create,edit,delete and read meetings  
- **Resident**
  - View all community meetings 



## Low-fidelity wireframe
- **Sign In/Sign Up**
<img width="2090" height="1941" alt="image" src="https://github.com/user-attachments/assets/bf510630-fd64-4929-b79d-27ae32a6c875" />
  
- **Admin panel**
<img width="6104" height="7279" alt="image" src="https://github.com/user-attachments/assets/c97facf7-1d10-48d4-9148-d1fee317cf7b" />

- **User panel**
<img width="6052" height="4667" alt="image" src="https://github.com/user-attachments/assets/4504dd74-7bbd-4160-a0d0-cea5ea768436" />

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

  ```env
  NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
  ```
  > [!NOTE]
  > This example uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, which refers to Supabase's new **publishable** key format.
  > Both legacy **anon** keys and new **publishable** keys can be used with this variable name during the transition period. Supabase's dashboard may show `NEXT_PUBLIC_SUPABASE_ANON_KEY`; its value can be used in this example.
  > See the [full announcement](https://github.com/orgs/supabase/discussions/29260) for more information.

  Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.


Aleksandra 
Alina
Diana

<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>
