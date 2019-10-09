import { Observable } from 'rxjs';
import {
  ProductInterestList,
  ProductInterestRelation,
} from '../../../model/product-interest.model';

export abstract class UserInterestsAdapter {
  /**
   * Abstract method used to load product interests for an user.
   *
   * @param userId The `userId` for given user
   * @param pageSize
   * @param currentPage
   * @param sort Sorting method
   */
  abstract getInterests(
    userId: string,
    pageSize?: number,
    currentPage?: number,
    sort?: string
  ): Observable<ProductInterestList>;

  /**
   * Abstract method used to remove product interest for an user.
   *
   * @param userId The `userId` for given user
   * @param ProductInterestRelation The product interest to be removed.
   */
  abstract removeInterests(
    userId: string,
    item: ProductInterestRelation
  ): Observable<any[]>;
}