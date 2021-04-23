import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {v4 as uuidv4} from 'uuid';
import {DiffMatchPatch} from 'diff-match-patch-ts';
import * as _ from 'lodash';

const randomColor = require('randomcolor');
const color = require('color');

import {DrugService} from '../../shared/services/drug.service';
import {DrugViewConfig, DrugViewMode} from '../drug-view-config.interface';

/**
 * DrugComponent
 * The DrugComponent is the main component for the Drug view and coordinates data sharing and event handling across all its children
 * components (DrugTimeline, DrugText and DrugHeader). Events from child components are observed and responded to and data is propagated
 * down into the child components accordingly. Overall state of the Drug view is managed using params in the drugViewConfig object.
 */
@Component({
  selector: 'app-drug',
  templateUrl: './drug.component.html',
  styleUrls: ['./drug.component.scss']
})
export class DrugComponent implements OnInit {

  // default empty drugViewConfig
  drugViewConfig: DrugViewConfig = {
    drugViewMode: DrugViewMode.none,
    inViewLabelOne: undefined,
    inViewLabelTwo: undefined,
    labelDiff: undefined,
    isPatentInView: false,
    inViewPatent: undefined
  };

  timelineItems: TimelineItem[] = [];
  isPageLoading = true;
  isTextLoading = false;
  ndaNumber: string; // NDA number of Drug currently in-view
  drug: any; // Raw data (from the API/DrugService) of the Drug currently in-view

  constructor(
    private route: ActivatedRoute,
    private drugService: DrugService,
  ) { }

  /**
   * onPatentClaimTagClicked handler
   * handles events from the DrugText component once a patent claim tag is clicked by the user. Finds the appropriate patent and patent
   * claim from the drug patents and triggers a drugViewConfig change accordingly.
   * @param event: event emitted from the DrugText component, representing the user clicking on a patent claim tag
   */
  onPatentClaimTagClicked(event: any): void {
    const patent = _.find(this.drug.drugPatents, (p: any) => p.patent_number === event.patent_number);
    const claim = _.find(patent.claims, (c: any) => c.claim_number === event.claim_number);

    this.onDrugViewChange({
      drugViewMode: this.drugViewConfig.drugViewMode,
      inViewLabelOne: this.drugViewConfig.inViewLabelOne,
      inViewLabelTwo: this.drugViewConfig.inViewLabelTwo,
      isPatentInView: true,
      inViewPatentNumber: patent.patent_number,
      inViewPatent: claim});
  }

  /**
   * onClasePatentViewClicked handler
   * handles events from the DrugText component once the close button is clicked on the patent viewing window. Resets the patent and patent
   * claim currently in-view and triggers a drugViewConfig change accordingly.
   */
  onClosePatentViewClicked(): void {
    this.onDrugViewChange({
      drugViewMode: this.drugViewConfig.drugViewMode,
      inViewLabelOne: this.drugViewConfig.inViewLabelOne,
      inViewLabelTwo: this.drugViewConfig.inViewLabelTwo,
      isPatentInView: false,
      inViewPatentNumber: undefined,
      inViewPatent: undefined});
  }

  /**
   * onDrugViewChange handler
   * This handler is meant to be fired whenever a change is made that constitutes a change to the DrugViewConfig whether from this
   * component or from a child component. It sets the new drugViewConfig and changes the view and data provided to DrugComponents children
   * accordingly, this is also where the diff is executed.
   * @param drugViewConfig: an object describing the new view to the rendered for the Drug view
   */
  onDrugViewChange(drugViewConfig: DrugViewConfig): void {

    // set new drugViewConfig
    this.drugViewConfig = drugViewConfig;

    // if two labels are selected (ie the new drugViewConfig indicates a label diff)...
    if (drugViewConfig.inViewLabelOne && drugViewConfig.inViewLabelTwo) {
      const labelSectionDiffs: { name: string, scores?: any[], diff: any}[] = [];

      // ...then iterate through each section of the label
      drugViewConfig.inViewLabelOne.data.sections.forEach((section: any) => {

        // grab the alternate section from the opposing label
        const labelTwoSection = _.find(drugViewConfig.inViewLabelTwo.data.sections, (labelTwoSec: any) => {
          return labelTwoSec.name === section.name;
        });

        // execute a diff on the two sections and clean it up to make it human readable
        const diffTool = new DiffMatchPatch();
        const diff = diffTool.diff_main(section.text, labelTwoSection.text);
        diffTool.diff_cleanupSemantic(diff);

        // create a new section object with the diff data, patent claim scores and section name. store it.
        labelSectionDiffs.push({ name: section.name, scores: labelTwoSection.scores, diff });
      });

      // store the diffs in the drugViewConfig, so they can be delivered to and presented by the DrugText component
      this.drugViewConfig.labelDiff = {
        sections: labelSectionDiffs
      };
    }
  }

  /**
   * On initialization of the DrugComponent, fetch the Drug data from the API and add each timeline and patent found
   * to the timelineItems array to be provided to the DrugTimeline component for rendering
   */
  ngOnInit(): void {
    // get NDA number from current URL route
    this.ndaNumber = this.route.snapshot.params.NDANumber;

    this.drugService.getDrugByApplicationNumber(this.ndaNumber).subscribe((response) => {

      // store raw drug data for convenience in case needed for later features
      this.drug = response;

      // for every drug label present, add a label timeline item to the timelineItems arr
      this.drug.drugLabels.forEach((label: any) => {
        const timelineLabelColor = color(randomColor({ luminosity: 'light', hue: 'random '}));
        const timelineLabelColorDarkened = timelineLabelColor.darken(0.666);
        const timelineLabel = {
          id: uuidv4(),
          content: 'L',
          start: label.published_date,
          group: 'label',
          className: 'timeline-label-identifier',
          style: `color: ${timelineLabelColorDarkened}; border-color: ${timelineLabelColorDarkened}; background: ${timelineLabelColor}`,
          title: label.application_numbers[0],
          data: label,
          color
        };
        this.timelineItems.push(timelineLabel);
      });

      // for every drug patent present, add a patent timeline item to the timelineItems arr
      this.drug.drugPatents.forEach((patent: any) => {
        const timelinePatent = {
          id: uuidv4(),
          content: 'P',
          start: patent.published_date,
          group: 'patent',
          className: 'timeline-patent-identifier',
          title: patent.patent_number,
          data: patent
        };
        this.timelineItems.push(timelinePatent);
      });

      this.isPageLoading = false;
    });
  }

}

/**
 * Interface for objects used in the visJS timeline library. Fits the visJS timeline item construct but includes
 * extra params specific to this web applications use case.
 */
export interface TimelineItem {
  id: string;
  content: string;
  start: string;
  group: string;
  className: string;
  title: string;
  data?: any;
}
