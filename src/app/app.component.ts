import { Component } from '@angular/core';
import { Cell } from "./interfaces/cell";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  result:string = "__";
  submitForm(gridSize,initialState, coordinatesAndNumber ) {
    let gridSizeArray: number[] = [];
    let initialStateArray: number[] = [];
    let coordAndNumArray: number[] = [];


    gridSize.split(",").forEach((el) => gridSizeArray.push(parseInt(el)));
    initialState.split(",").forEach((el) => initialStateArray.push(parseInt(el)));
    coordinatesAndNumber.split(",").forEach((el) => coordAndNumArray.push(parseInt(el)));

    let grid = new Grid(gridSizeArray[0], gridSizeArray[1], initialStateArray);
    let observedCell: Cell = { xAxis: coordAndNumArray[0], yAxis: coordAndNumArray[1] };

    let timesGreen = grid.howManyTimesGreen(observedCell, coordAndNumArray[2]);
    this.result = timesGreen.toString();

  }
}

// green = 1, red = 0;
// green if surrounded by 3 or 6 green and is red, otherwise stays red
// red if surrounded by !2, !3, !6 and is green otherwise stays red
export class Grid {
  public width: number;
  public height: number;

  public matrixCurrentState: number[][];
  public matrixFutureState: number[][];

  constructor(width: number, height: number, genZero: number[]) {
    this.height = height;
    this.width = width;

    this.matrixCurrentState = [];

    for (let i: number = 0; i < width; i++) {
      // loop with nested for loop that turns our array of 1's and 0's
      // into a two dimentional array, with rows and columns based on the size of the grid (x,y).

      this.matrixCurrentState[i] = [];
      for (let j: number = 0; j < height; j++) {
        this.matrixCurrentState[i].push(genZero.shift()!);// (!) Non-null assertion operator
        // that we tell .ts guarentees that no null values will enter matrixCurrentState
      }
    }

    this.matrixFutureState = this.emptyArray(height);
  }

  // private method that we use to empty the matrixFutureState matrix
  private emptyArray(height: number) {
    const emptyMatrix: number[][] = [];
    for (let i = 0; i < height; i++) {
      emptyMatrix.push([]);
    }
    return emptyMatrix;
  }

  howManyTimesGreen(countedCell: Cell, numOfTurns: number) {
    let matrixCurrentState = this.matrixCurrentState; // variable that holds the location,
    // so that we dont use 'this'.
    const countedCellValue = getCell(matrixCurrentState, countedCell.yAxis, countedCell.xAxis); // use the getCell function to get rhe cell that we want to count how many times turns green

    let countedCellFutureValue: number | null = -1; // variable to hold the cell's future value
    // with default being -1, to avoid any initial counting

    let timesGreen = 0; // how many times the cell holds "1"?

    while (numOfTurns > 0) { // while loop to go through all the number of turns given

      // forEach loops through every cell of the matrix
      matrixCurrentState.forEach((row, y) => {
        row.forEach((cellColor, x) => {
          const currentCell: Cell = { xAxis: x, yAxis: y }; // variable to hold current cell

          const currentCellSurroundings = surroundings(currentCell, matrixCurrentState);

          if (cellColor === 0) { // if red
            // counts occurrences of green cells arround the current cell
            const greenOccurrences = countOccurrences(currentCellSurroundings, 1);

            if (greenOccurrences === 3 || greenOccurrences === 6) {
              this.matrixFutureState[y][x] = 1;
              // if the count is 3 or 6, it is set to green
            } else {
              this.matrixFutureState[y][x] = 0; // if not, it will be red
            }

          } else if (cellColor === 1) { // if green
            const greenOccurrences = countOccurrences(currentCellSurroundings, 1);

            if (greenOccurrences === 2 ||
              greenOccurrences === 3 ||
              greenOccurrences === 6) {
              this.matrixFutureState[y][x] = 1;
            } else {
              this.matrixFutureState[y][x] = 0;
            }
          }

        });
      });

      // we check if the cell we are observing will turn green in the next turn
      countedCellFutureValue =
        getCell(this.matrixFutureState, countedCell.yAxis, countedCell.xAxis);

      // if it will turn green, and isnt green in the current generation 
      // it will increase the amount of times it has turned green by one
      if (countedCellValue !== 1 && countedCellFutureValue === 1) {
        timesGreen++;
      }

      // at the end of the turn matrixCurrentState takes the value of this.matrixFutureState
      matrixCurrentState = this.matrixFutureState;

      // and this.matrixFutureState is emptied for the next iteration using emptyArray()
      this.matrixFutureState = this.emptyArray(this.height);
      numOfTurns--;
    }


    // function used within this method to get a cell's value
    function getCell(matrix: number[][], y: number, x: number) {
      const noValue = null;
      let cellValue;
      let hasValue;

      // try and catch statement to prevent errors when dealing with 2D arrays
      try {
        // we compare to undefined, because zeroes in the cells may cause 
        // an if(!matrix[y][x]) statement to return true, since 0 is falsy
        hasValue = matrix[y][x] !== undefined;
        cellValue = hasValue ? matrix[y][x] : noValue;
      } catch (e) {
        cellValue = noValue;
      }

      return cellValue;
    }

    // function used within this method to get a cell's surroundings in the form of an array
    function surroundings(cell: Cell, matrix: number[][]) {
      const yAxis = cell.yAxis;
      const xAxis = cell.xAxis;

      // clockwise rotation
      const surroundingCells = {
        upMiddle: getCell(matrix, yAxis - 1, xAxis),
        upRight: getCell(matrix, yAxis - 1, xAxis + 1),
        rightMiddle: getCell(matrix, yAxis, xAxis + 1),
        downRight: getCell(matrix, yAxis + 1, xAxis + 1),
        downMiddle: getCell(matrix, yAxis + 1, xAxis),
        downLeft: getCell(matrix, yAxis + 1, xAxis - 1),
        leftMiddle: getCell(matrix, yAxis, xAxis - 1),
        upLeft: getCell(matrix, yAxis - 1, xAxis - 1)
      };

      // returns an array of all the values from the surrounding cells
      return Object.values(surroundingCells);

    }

    // function used within this method to get the number of occurrences of a given element
    // within a given array
    function countOccurrences(array: (number | null)[], value: number) {
      let numberOfOccurrences: number = 0;

      array.forEach((cellItem) => {
        if (cellItem === value) {
          numberOfOccurrences++;
        }
      });

      return numberOfOccurrences;
    }

    return timesGreen;

  }
}