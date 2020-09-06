import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({ templateUrl: './layout.component.html' })
export class LayoutComponent implements OnInit {

  constructor(
    private router: Router
  ) {
    // this.router.navigate(['/']);
  }

  ngOnInit(): void {
  }

}
