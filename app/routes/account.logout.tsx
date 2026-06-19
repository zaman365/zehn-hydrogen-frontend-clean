import type {Route} from './+types/account.logout';

export async function loader({context}: Route.LoaderArgs) {
  return context.customerAccount.logout();
}

export async function action({context}: Route.ActionArgs) {
  return context.customerAccount.logout();
}
