import { HttpHeaders } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FeatureConfigService } from '../../../features-config/services/feature-config.service';
import { Cart } from '../../../model/cart.model';
import { ProductImageNormalizer } from '../../../occ/adapters/product/converters/index';
import { ConverterService } from '../../../util/converter.service';
import { Occ } from '../../occ-models/occ.models';
import { OccEndpointsService } from '../../services';
import {
  InterceptorUtil,
  USE_CLIENT_TOKEN,
} from '../../utils/interceptor-util';
import {
  OCC_USER_ID_ANONYMOUS,
  OCC_CART_ID_CURRENT,
} from '../../utils/occ-constants';
import { OccCartAdapter } from './occ-cart.adapter';

const userId = '123';
const cartId = '456';
const toMergeCart = { guid: '123456' };
const cartData: Occ.Cart = {
  store: 'electronics',
  guid: '1212121',
};
const cartDataList: Occ.CartList = {
  carts: [cartData],
};
const mergedCart: Cart = {
  name: 'mergedCart',
};

class MockOccEndpointsService {
  getUrl(endpoint: string, _urlParams?: object, _queryParams?: object) {
    return this.getEndpoint(endpoint);
  }
  getEndpoint(url: string) {
    return url;
  }
}

class MockFeatureConfigService {
  isLevel(_featureLevel: string): boolean {
    return true;
  }
}

// Depracted as of 1.1
const usersEndpoint = 'users';
const cartsEndpoint = 'carts';
const DETAILS_PARAMS =
  'DEFAULT,potentialProductPromotions,appliedProductPromotions,potentialOrderPromotions,appliedOrderPromotions,' +
  'entries(totalPrice(formattedValue),product(images(FULL),stock(FULL)),basePrice(formattedValue),updateable),' +
  'totalPrice(formattedValue),totalItems,totalPriceWithTax(formattedValue),totalDiscounts(value,formattedValue),subTotal(formattedValue),' +
  'deliveryItemsQuantity,deliveryCost(formattedValue),totalTax(formattedValue),pickupItemsQuantity,net,' +
  'appliedVouchers,productDiscounts(formattedValue),user';

describe('OccCartAdapter', () => {
  let occCartAdapter: OccCartAdapter;
  let httpMock: HttpTestingController;
  let converterService: ConverterService;
  let occEndpointService: OccEndpointsService;
  let featureConfigService: FeatureConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OccCartAdapter,
        ProductImageNormalizer,
        { provide: OccEndpointsService, useClass: MockOccEndpointsService },
        { provide: FeatureConfigService, useClass: MockFeatureConfigService },
      ],
    });

    occCartAdapter = TestBed.get(OccCartAdapter as Type<OccCartAdapter>);
    httpMock = TestBed.get(HttpTestingController as Type<
      HttpTestingController
    >);
    converterService = TestBed.get(ConverterService as Type<ConverterService>);
    occEndpointService = TestBed.get(OccEndpointsService as Type<
      OccEndpointsService
    >);
    featureConfigService = TestBed.get(FeatureConfigService as Type<
      FeatureConfigService
    >);

    spyOn(converterService, 'pipeable').and.callThrough();
    spyOn(converterService, 'pipeableMany').and.callThrough();
    spyOn(occEndpointService, 'getUrl').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('load all carts', () => {
    it('should load all carts details data for given user with details flag', () => {
      let result;
      occCartAdapter.loadAll(userId).subscribe(res => (result = res));

      const mockReq = httpMock.expectOne(req => {
        return req.method === 'GET' && req.url === 'carts';
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(occEndpointService.getUrl).toHaveBeenCalledWith('carts', {
        userId,
      });
      mockReq.flush(cartDataList);
      expect(result).toEqual(cartDataList.carts);
    });
  });

  describe('load cart data', () => {
    it('should load cart detail data for given userId, cartId', () => {
      let result;
      occCartAdapter.load(userId, cartId).subscribe(res => (result = res));

      const mockReq = httpMock.expectOne(req => {
        return req.method === 'GET' && req.url === 'cart';
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(occEndpointService.getUrl).toHaveBeenCalledWith('cart', {
        userId,
        cartId,
      });
      mockReq.flush(cartData);
      expect(result).toEqual(cartData);
    });

    it('should load current cart for given userId', () => {
      let result;
      occCartAdapter
        .load(userId, OCC_CART_ID_CURRENT)
        .subscribe(res => (result = res));

      const mockReq = httpMock.expectOne(req => {
        return req.method === 'GET' && req.url === 'carts';
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(occEndpointService.getUrl).toHaveBeenCalledWith('carts', {
        userId,
      });
      mockReq.flush({ carts: [cartData] });
      expect(result).toEqual(cartData);
    });
  });

  describe('create a cart', () => {
    it('should able to create a new cart for the given user ', () => {
      let result;
      occCartAdapter.create(userId).subscribe(res => (result = res));

      const mockReq = httpMock.expectOne(req => {
        return req.method === 'POST' && req.url === 'createCart';
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(occEndpointService.getUrl).toHaveBeenCalledWith(
        'createCart',
        { userId },
        {}
      );
      mockReq.flush(cartData);
      expect(result).toEqual(cartData);
    });
  });

  describe('merge a cart', () => {
    it('should able to merge a cart to current one for the given user ', () => {
      let result;
      occCartAdapter
        .create(userId, cartId, toMergeCart.guid)
        .subscribe(res => (result = res));

      const mockReq = httpMock.expectOne(req => {
        return req.method === 'POST' && req.url === 'createCart';
      });

      expect(occEndpointService.getUrl).toHaveBeenCalledWith(
        'createCart',
        { userId },
        { oldCartId: cartId, toMergeCartGuid: toMergeCart.guid }
      );

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(mergedCart);
      expect(result).toEqual(mergedCart);
    });
  });

  describe('add email to cart', () => {
    it('should able to assign email to cart for anonymous user', () => {
      const email = 'tester@sap.com';
      let result: Object;

      occCartAdapter
        .addEmail(userId, cartId, email)
        .subscribe(value => (result = value));

      const mockReq = httpMock.expectOne({ method: 'PUT' });

      expect(mockReq.request.serializeBody()).toEqual(`email=${email}`);

      expect(occEndpointService.getUrl).toHaveBeenCalledWith('addEmail', {
        userId,
        cartId,
      });
      expect(mockReq.cancelled).toBeFalsy();

      mockReq.flush('');
      expect(result).toEqual('');
    });
  });

  describe('delete', () => {
    it('should delete the cart', () => {
      let result: Object;

      occCartAdapter
        .delete(userId, cartId)
        .subscribe(value => (result = value));

      const mockReq = httpMock.expectOne({
        method: 'DELETE',
        url: 'deleteCart',
      });

      expect(occEndpointService.getUrl).toHaveBeenCalledWith('deleteCart', {
        userId,
        cartId,
      });
      expect(mockReq.cancelled).toBeFalsy();

      mockReq.flush('');
      expect(result).toEqual('');
    });

    it('should add client token if userId is anonymous', () => {
      let result: Object;
      let headers = new HttpHeaders();
      headers = InterceptorUtil.createHeader(USE_CLIENT_TOKEN, true, headers);

      occCartAdapter
        .delete(OCC_USER_ID_ANONYMOUS, cartId)
        .subscribe(value => (result = value));

      const mockReq = httpMock.expectOne({
        method: 'DELETE',
        url: 'deleteCart',
      });

      expect(occEndpointService.getUrl).toHaveBeenCalledWith('deleteCart', {
        userId: OCC_USER_ID_ANONYMOUS,
        cartId,
      });
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.headers).toEqual(headers);

      mockReq.flush('');
      expect(result).toEqual('');
    });
  });
  /**
   * @deprecated Since 1.1
   * Remove when legacy code is removed.
   */
  describe('legacy', () => {
    beforeEach(() => {
      spyOn(featureConfigService, 'isLevel').and.returnValue(false);
    });

    describe('load all carts', () => {
      it('should load all carts details data for given user with details flag', () => {
        let result;
        occCartAdapter.loadAll(userId).subscribe(res => (result = res));

        const mockReq = httpMock.expectOne(req => {
          return (
            req.method === 'GET' &&
            req.url === `${usersEndpoint}/${userId}/${cartsEndpoint}/`
          );
        });

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.params.get('fields')).toEqual(
          'carts(' + DETAILS_PARAMS + ',saveTime)'
        );
        mockReq.flush(cartDataList);
        expect(result).toEqual(cartDataList.carts);
      });
    });

    describe('load cart data', () => {
      it('should load cart detail data for given userId, cartId', () => {
        let result;
        occCartAdapter.load(userId, cartId).subscribe(res => (result = res));

        const mockReq = httpMock.expectOne(req => {
          return (
            req.method === 'GET' &&
            req.url === `${usersEndpoint}/${userId}/${cartsEndpoint}/${cartId}`
          );
        });

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.params.get('fields')).toEqual(DETAILS_PARAMS);
        mockReq.flush(cartData);
        expect(result).toEqual(cartData);
      });

      it('should load current cart for given userId', () => {
        let result;
        occCartAdapter
          .load(userId, OCC_CART_ID_CURRENT)
          .subscribe(res => (result = res));

        const mockReq = httpMock.expectOne(req => {
          return (
            req.method === 'GET' &&
            req.url === `${usersEndpoint}/${userId}/${cartsEndpoint}/`
          );
        });

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.params.get('fields')).toEqual(
          'carts(' + DETAILS_PARAMS + ',saveTime)'
        );
        mockReq.flush({ carts: [cartData] });
        expect(result).toEqual(cartData);
      });
    });

    describe('create a cart', () => {
      it('should able to create a new cart for the given user ', () => {
        let result;
        occCartAdapter.create(userId).subscribe(res => (result = res));

        const mockReq = httpMock.expectOne(req => {
          return (
            req.method === 'POST' &&
            req.url === `${usersEndpoint}/${userId}/${cartsEndpoint}/`
          );
        });

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.params.get('fields')).toEqual(DETAILS_PARAMS);
        mockReq.flush(cartData);
        expect(result).toEqual(cartData);
      });
    });

    describe('merge a cart', () => {
      it('should able to merge a cart to current one for the given user ', () => {
        let result;
        occCartAdapter
          .create(userId, cartId, toMergeCart.guid)
          .subscribe(res => (result = res));

        const mockReq = httpMock.expectOne(req => {
          return (
            req.method === 'POST' &&
            req.url === `${usersEndpoint}/${userId}/${cartsEndpoint}/`
          );
        });

        expect(mockReq.request.params.get('oldCartId')).toEqual(cartId);

        expect(mockReq.request.params.get('toMergeCartGuid')).toEqual(
          toMergeCart.guid
        );

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        mockReq.flush(mergedCart);
        expect(result).toEqual(mergedCart);
      });
    });
  });
});
