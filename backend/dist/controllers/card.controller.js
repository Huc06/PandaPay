"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardController = exports.CardController = void 0;
const Card_model_1 = require("../models/Card.model");
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../utils/logger"));
class CardController {
    async createCard(req, res, next) {
        try {
            const { cardType = 'virtual' } = req.body;
            const userId = req.user.id;
            // Generate card UUID and number
            const cardUuid = (0, uuid_1.v4)();
            const cardNumber = CardController.generateCardNumber();
            // Create card
            const card = await Card_model_1.Card.create({
                cardUuid,
                userId,
                cardType,
                cardNumber,
                isActive: true,
                isPrimary: false,
            });
            logger_1.default.info(`Card created for user ${userId}`, {
                cardUuid,
                cardType,
            });
            res.status(201).json({
                success: true,
                message: 'Card created successfully',
                card: {
                    cardUuid: card.cardUuid,
                    cardType: card.cardType,
                    cardNumber: card.cardNumber,
                    isActive: card.isActive,
                    issueDate: card.issueDate,
                    expiryDate: card.expiryDate,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Create card error:', error);
            next(error);
        }
    }
    static generateCardNumber() {
        // Generate a 16-digit card number
        const prefix = '4532'; // Visa prefix
        let number = prefix;
        for (let i = 0; i < 12; i++) {
            number += Math.floor(Math.random() * 10);
        }
        return number;
    }
    async getUserCards(req, res, next) {
        try {
            const userId = req.user._id;
            const cards = await Card_model_1.Card.find({ userId }).sort({ createdAt: -1 });
            return res.json({
                success: true,
                data: {
                    cards: cards.map(card => ({
                        id: card._id,
                        cardUuid: card.cardUuid,
                        cardType: card.cardType,
                        cardNumber: card.cardNumber,
                        isActive: card.isActive,
                        isPrimary: card.isPrimary,
                        issueDate: card.issueDate,
                        expiryDate: card.expiryDate,
                        createdAt: card.createdAt,
                        updatedAt: card.updatedAt
                    }))
                }
            });
        }
        catch (error) {
            logger_1.default.error('Get user cards error:', error);
            next(error);
        }
    }
    async getCard(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateCard(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCard(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async activateCard(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deactivateCard(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async blockCard(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async unblockCard(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async setPrimaryCard(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateCardLimits(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async resetCardLimits(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCardTransactions(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCardStats(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllCards(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async forceBlockCard(_req, res, next) {
        try {
            res.json({
                success: true,
                message: 'Card controller method not implemented yet',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CardController = CardController;
exports.cardController = new CardController();
//# sourceMappingURL=card.controller.js.map