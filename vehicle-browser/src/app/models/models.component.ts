import { Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ICar } from "../interfaces/ICar";

@Component({
  selector: "app-models",
  templateUrl: "./models.component.html",
  styleUrls: ["./models.component.css"]
})
export class ModelsComponent implements OnInit {
  years: number[] = [];
  makes: string[] = [];
  cars: ICar[] = [];
  displayedCars: ICar[] = [];
  selectedYear = 2012;
  selectedMake = "Tesla";
  curPage = 1;
  isNextDisabled = false;

  displayedColumns: string[] = ["make", "model", "year"];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getMakes();
    this.getYears();
    this.refreshTable();
  }

  getMakes() {
    this.http
      .get<string[]>("https://vehicle-data.azurewebsites.net/api/makes")
      .subscribe(makes => {
        makes.unshift(null);
        this.makes = makes;
      });
  }

  getYears() {
    this.http
      .get<number[]>("https://vehicle-data.azurewebsites.net/api/years")
      .subscribe(years => {
        years.unshift(null);
        this.years = years;
      });
  }

  refreshTable() {
    this.http
      .get<ICar[]>(
        `https://vehicle-data.azurewebsites.net/api/models?make=${
          this.selectedMake ? this.selectedMake : ""
        }&year=${this.selectedYear ? this.selectedYear : ""}&fetch=30`
      )
      .subscribe(cars => {
        this.cars = cars;
        this.curPage = 1;
        this.displayedCars = cars.slice(0, 10);
        this.checkNextEnabled();
      });
  }

  paginateForwards() {
    this.curPage++;
    if (this.curPage * 10 + 20 >= this.cars.length && !this.isNextDisabled) {
      this.http
        .get<ICar[]>(
          `https://vehicle-data.azurewebsites.net/api/models?make=${
            this.selectedMake ? this.selectedMake : ""
          }&year=${
            this.selectedYear ? this.selectedYear : ""
          }&fetch=30&offset=${this.cars.length}`
        )
        .subscribe(cars => {
          this.cars.push(...cars);
          this.displayedCars = this.cars.slice(
            this.curPage * 10 - 10,
            this.curPage * 10
          );
          this.checkNextEnabled();
        });
    } else if (!this.isNextDisabled) {
      this.displayedCars = this.cars.slice(
        this.curPage * 10 - 10,
        this.curPage * 10
      );
      this.checkNextEnabled();
    }
  }

  paginateBackwards() {
    this.curPage--;
    this.displayedCars = this.cars.slice(
      this.curPage * 10 - 10,
      this.curPage * 10
    );
    this.checkNextEnabled();
  }

  checkNextEnabled() {
    if (this.curPage * 10 >= this.cars.length) {
      this.isNextDisabled = true;
      return;
    }
    this.isNextDisabled = false;
  }
}
