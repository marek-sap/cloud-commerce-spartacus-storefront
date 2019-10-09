import {
  PRODUCT_INTERESTS,
  REMOVE_PRODUCT_INTERESTS_PROCESS_ID,
} from '../user-state';
import {
  ProductInterestList,
  ProductInterestRelation,
} from '../../../model/product-interest.model';
import { PROCESS_FEATURE } from '../../../process/store/process-state';
import {
  LoaderLoadAction,
  LoaderFailAction,
  LoaderSuccessAction,
  LoaderResetAction,
} from '../../../state/utils/loader/loader.action';
import {
  EntityFailAction,
  EntityLoadAction,
  EntitySuccessAction,
} from '../../../state/utils/entity-loader/entity-loader.action';
export const LOAD_PRODUCT_INTERESTS = 'Load Product Interests';
export const LOAD_PRODUCT_INTERESTS_FAIL = 'Load Product Interests Fail';
export const LOAD_PRODUCT_INTERESTS_SUCCESS = 'Load Product Interests Success';
export const REMOVE_PRODUCT_INTERESTS = 'Remove Product Interests';
export const REMOVE_PRODUCT_INTERESTS_SUCCESS =
  'Remove Product Interests Success';
export const REMOVE_PRODUCT_INTERESTS_FAIL = 'Remove Product Interests Fail';
export const CLEAR_PRODUCT_INTERESTS = 'Clear Product Interests';

export class LoadProductInterests extends LoaderLoadAction {
  readonly type = LOAD_PRODUCT_INTERESTS;
  constructor(
    public payload: {
      userId: string;
      pageSize: number;
      currentPage?: number;
      sort?: string;
    }
  ) {
    super(PRODUCT_INTERESTS);
  }
}

export class LoadProductInterestsFail extends LoaderFailAction {
  readonly type = LOAD_PRODUCT_INTERESTS_FAIL;
  constructor(public payload: any) {
    super(PRODUCT_INTERESTS, payload);
  }
}

export class LoadProductInterestsSuccess extends LoaderSuccessAction {
  readonly type = LOAD_PRODUCT_INTERESTS_SUCCESS;
  constructor(public payload: ProductInterestList) {
    super(PRODUCT_INTERESTS);
  }
}

export class RemoveProductInterests extends EntityLoadAction {
  readonly type = REMOVE_PRODUCT_INTERESTS;
  constructor(
    public payload: {
      userId: string;
      item: ProductInterestRelation;
    }
  ) {
    super(PROCESS_FEATURE, REMOVE_PRODUCT_INTERESTS_PROCESS_ID);
  }
}

export class RemoveProductInterestsSuccess extends EntitySuccessAction {
  readonly type = REMOVE_PRODUCT_INTERESTS_SUCCESS;
  constructor(public payload: any) {
    super(PROCESS_FEATURE, REMOVE_PRODUCT_INTERESTS_PROCESS_ID);
  }
}

export class RemoveProductInterestsFail extends EntityFailAction {
  readonly type = REMOVE_PRODUCT_INTERESTS_FAIL;
  constructor(public payload: any) {
    super(PROCESS_FEATURE, REMOVE_PRODUCT_INTERESTS_PROCESS_ID, payload);
  }
}

export class ClearProductInterests extends LoaderResetAction {
  readonly type = CLEAR_PRODUCT_INTERESTS;
  constructor() {
    super(PRODUCT_INTERESTS);
  }
}

export type ProductInterestsAction =
  | LoadProductInterests
  | LoadProductInterestsFail
  | LoadProductInterestsSuccess
  | RemoveProductInterests
  | RemoveProductInterestsSuccess
  | RemoveProductInterestsFail
  | ClearProductInterests;