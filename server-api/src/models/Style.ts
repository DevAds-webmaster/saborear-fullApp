import { Schema, model, Document } from "mongoose";


export interface IStyle {
    colorBackground: string;
    headerStyles:{
        container: string;
        sloganStyle: string;
    };
    categorySectionStyles:{
        container: string;
        title: string;
        descriptionText: string;
        descriptionBorder: string;
        itemsText: string;
        itemTitle: string;
        itemDescription: string;
        itemHover: string;
        tagsTextColor: string;
    };
    principalSectionStyles:{
        container: string;
        title: string;
        descriptionText: string;
        descriptionBorder: string;
        itemsText: string;
        itemContainer: string;
        itemHover: string;
        tagsTextColor: string;
    };
    modalsItemsStyles:{
        container:  string;
        textColor:  string;
        tagsTextColor: string;
    };
    modalsParamStyles:{
        container:  string;
        textColor:  string;
    };
    displayDePasoStyles:{
        container: string;
        title: string;
        descriptionText: string;
        itemsCatText: string;
        descriptionBorder: string;
        itemsText: string;
        itemContainer: string;
        itemHover: string;
        tagsTextColor: string;
    };
    displayComercialStyles: IDspComStyles[];
}

export interface IDspComStyles {
    name: string;
    container: string;
    title: string;
    descriptionText: string;
    descriptionBorder: string;
    gapItems: string;
    itemsText: string;
    itemsTitle: string;
    itemsDescription: string;
    itemsPrice: string;
    itemContainer: string;
    tagsTextColor: string;
}

export const dspComStylesSchema = new Schema<IDspComStyles>({
    name: { type: String, required: true },
    container: { type: String, required: true },
    title: { type: String, required: true },
    descriptionText: { type: String, required: true },
    descriptionBorder:{ type: String, required: true },
    gapItems: { type: String, required: true },
    itemsText: { type: String, required: true },
    itemsTitle: { type: String, required: true },
    itemsDescription: { type: String, required: true },
    itemsPrice: { type: String, required: true },
    itemContainer: { type: String, required: true },
    tagsTextColor: { type: String, required: true }
  });


export const styleSchema = new Schema<IStyle>({
    colorBackground: { type: String, required: true },
    headerStyles:{
        container: { type: String, required: true },
        sloganStyle: { type: String, required: true }
    },
    categorySectionStyles:{
        container: { type: String, required: true },
        title: { type: String, required: true },
        descriptionText: { type: String, required: true },
        descriptionBorder: { type: String, required: true },
        itemsText: { type: String, required: true },
        itemTitle: { type: String, required: true },
        itemDescription: { type: String, required: true },
        itemHover: { type: String, required: true },
        tagsTextColor: { type: String, required: true }
    },
    principalSectionStyles:{
        container: { type: String, required: true },
        title: { type: String, required: true },
        descriptionText: { type: String, required: true },
        descriptionBorder: { type: String, required: true },
        itemsText: { type: String, required: true },
        itemContainer: { type: String, required: true },
        itemHover: { type: String, required: true },
        tagsTextColor: { type: String, required: true }
    },
    modalsItemsStyles:{
        container:  { type: String, required: true },
        textColor:  { type: String, required: true },
        tagsTextColor: { type: String, required: true }
    },
    modalsParamStyles:{
        container:  { type: String, required: true },
        textColor:  { type: String, required: true }
    },
    displayDePasoStyles:{
        container: { type: String, required: true },
        title: { type: String, required: true },
        descriptionText: { type: String, required: true },
        itemsCatText: { type: String, required: true },
        descriptionBorder: { type: String, required: true },
        itemsText: { type: String, required: true },
        itemContainer: { type: String, required: true },
        itemHover: { type: String, required: true },
        tagsTextColor: { type: String, required: true }
    },
    displayComercialStyles: [dspComStylesSchema]
})