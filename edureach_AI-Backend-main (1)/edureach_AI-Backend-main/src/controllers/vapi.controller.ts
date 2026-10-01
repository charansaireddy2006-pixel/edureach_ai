import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model.ts";
import { initiateOutboundCall } from "../services/vapi.service.ts";

// POST /api/vapi/call
export const startCall = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber, preferredCourse } = req.body;

    console.log("Incoming Call Request:", req.body);
    console.log("Authenticated User:", (req as any).user);

    if (!phoneNumber || phoneNumber.trim().length < 10) {
      res.status(400).json({
        success: false,
        message: "Valid phone number is required.",
      });
      return;
    }

    const currentUser = (req as any).user;

    if (!currentUser || !currentUser.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
      return;
    }

    const user = await User.findById(currentUser.userId).select("name email");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    console.log("Found User:", user);

    const result = await initiateOutboundCall({
      phoneNumber: phoneNumber.trim(),
      userName: user.name,
      userEmail: user.email,
      preferredCourse,
    });

    res.status(200).json({
      success: true,
      message: "Call initiated. You will receive a call shortly.",
      data: {
        callId: result.id,
        status: result.status,
      },
    });
  } catch (error) {
    console.error("========== VAPI CONTROLLER ERROR ==========");
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown server error",
    });
  }
};