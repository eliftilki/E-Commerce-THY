import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormThyService } from '../../services/form-thy.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { ThyShopValidators } from '../../validators/thy-shop-validators';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {

  creditCardYears:number[]=[];
  creditCardMonths:number[]=[];

  checkoutFormGroup:FormGroup;

  countries:Country[]=[];

  shippingAddressStates:State[]=[];
  billingAddressStates:State[]=[];

  totalQuantity:number=0;
  totalPrice:number=0;

  constructor(private formBuilder:FormBuilder,
    private formService:FormThyService,
    private checkoutService:CheckoutService,
    private router:Router,
    private cartService:CartService
  ){}

  ngOnInit(): void {

    this.reviewCartDetails();
    
    this.checkoutFormGroup=this.formBuilder.group({
      customer:this.formBuilder.group({
        firstName:new FormControl('',[Validators.required,Validators.minLength(2),ThyShopValidators.notOnlyWhitespace]),
        lastName:new FormControl('',[Validators.required,Validators.minLength(2),ThyShopValidators.notOnlyWhitespace]),
        email:new FormControl('',[Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),

      shippingAddress:this.formBuilder.group({
        country:new FormControl('',[Validators.required]),
        street:new FormControl('',[Validators.required,Validators.minLength(2),ThyShopValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required,Validators.minLength(2),ThyShopValidators.notOnlyWhitespace]),
        state:new FormControl('',[Validators.required]),
        zipCode:new FormControl('',[Validators.required,Validators.minLength(2),ThyShopValidators.notOnlyWhitespace])
      }),

      billingAddress:this.formBuilder.group({
        country:new FormControl('',[Validators.required]),
        street:new FormControl('',[Validators.required,Validators.minLength(2),ThyShopValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required,Validators.minLength(2),ThyShopValidators.notOnlyWhitespace]),
        state:new FormControl('',[Validators.required]),
        zipCode:new FormControl('',[Validators.required,Validators.minLength(2),ThyShopValidators.notOnlyWhitespace])
      }),

      creditCard:this.formBuilder.group({
        cardType:new FormControl('',[Validators.required]),
        nameOnCard:new FormControl('',[Validators.required,Validators.minLength(2),ThyShopValidators.notOnlyWhitespace]),
        cardNumber:new FormControl('',[Validators.required,Validators.pattern('[0-9]{16}')]),
        securityCode:new FormControl('',[Validators.required,Validators.pattern('[0-9]{3}')]),
        expirationMonth:[''],
        expirationYear:['']
      })
    });

    const startMonth:number=new Date().getMonth()+1;

    this.formService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        this.creditCardMonths=data;
      }
    );

    this.formService.getCreditCardYears().subscribe(
      data=>{
        this.creditCardYears=data;
      }
    );

    this.formService.getCountries().subscribe(
      data=>{
        this.countries=data;
      }
    );

  }
  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity=>this.totalQuantity=totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice=>this.totalPrice=totalPrice
    );
  }

  onSubmit(){
    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order=new Order();
    order.totalPrice=this.totalPrice;
    order.totalQuantity=this.totalQuantity;

    const cartItems=this.cartService.cartItems;

    let orderItems:OrderItem[]=cartItems.map(tempCartItem =>new OrderItem(tempCartItem));

    let purchase=new Purchase();

    purchase.customer=this.checkoutFormGroup.controls['customer'].value;

    purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State=JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country=JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state=shippingState.name;
    purchase.shippingAddress.country=shippingCountry.name;

    purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State=JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country=JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state=billingState.name;
    purchase.billingAddress.country=billingCountry.name;

    purchase.order=order;
    purchase.orderItems=orderItems;

    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next:response=>{
          alert(`Your order has been received.\n Order tracking number:${response.orderTrackingNumber}`);

          this.resetCart();
        },

        error:err=>{
          alert(`There was an error:${err.message}`);
        }
      }
    )
  
    

  }
  resetCart() {
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl('/products');
  }

  get firstName(){return this.checkoutFormGroup.get('customer.firstName')};
  get lastName(){return this.checkoutFormGroup.get('customer.lastName')};
  get email(){return this.checkoutFormGroup.get('customer.email')};

  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country')};
  get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state')};
  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city')};
  get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street')};
  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode')};

  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country')};
  get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state')};
  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city')};
  get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street')};
  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode')};

  get cardType(){return this.checkoutFormGroup.get('creditCard.cardType')};
  get nameOnCard(){return this.checkoutFormGroup.get('creditCard.nameOnCard')};
  get cardNumber(){return this.checkoutFormGroup.get('creditCard.cardNumber')};
  get securityCode(){return this.checkoutFormGroup.get('creditCard.securityCode')};
  get expirationMonth(){return this.checkoutFormGroup.get('creditCard.expirationMonth')};
  get expirationYear(){return this.checkoutFormGroup.get('creditCard.expirationYear')};

  copyShippingAddressToBillingAddress(event) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls["billingAddress"]
        .setValue(this.checkoutFormGroup.controls["shippingAddress"].value);

        this.billingAddressStates=this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls["billingAddress"].reset();
      this.billingAddressStates=[];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup=this.checkoutFormGroup.get('creditCard');

    const currentYear:number=new Date().getFullYear();

    const selectedYear:number=Number(creditCardFormGroup.value.expirationYear);

    let startMonth:number;

    if(currentYear===selectedYear){
      
      startMonth=new Date().getMonth()+1;
    }
    else{
      startMonth=1;
    }

    this.formService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        this.creditCardMonths=data;
      }
    );
  }

  getStates(formGroupName: string) {
    const formGroup=this.checkoutFormGroup.get(formGroupName);
    const countryCode=formGroup.value.country.code;
    const countryName=formGroup.value.country.name;

    this.formService.getStates(countryCode).subscribe(
      data=>{
        if(formGroupName==='shippingAddress'){
          this.shippingAddressStates=data;
        }
        else{
          this.billingAddressStates=data;
        }

        formGroup.get('state').setValue(data[0]);
      }
    );
  }

}
