import {redirect} from 'react-router';
import type {Route} from './+types/collections._index';

export async function loader({request}: Route.LoaderArgs) {
  return redirect('/collections/all');
}
