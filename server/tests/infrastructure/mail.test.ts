import nodemailer from "nodemailer";

const mockedSendMail = jest.fn().mockResolvedValue({ messageId: "test-id" });

// Mock nodemailer with a factory
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: (args: any) => mockedSendMail(args),
  }),
}));

import { sendMail } from "../../src/infrastructure/mail";

describe("Mail Infrastructure", () => {
  it("should send an email with correct parameters and template", async () => {
    const params = {
      to: "test@example.com",
      subject: "Test Subject",
      title: "Test Title",
      content: "Test Content",
    };

    await sendMail(params);

    expect(mockedSendMail).toHaveBeenCalledTimes(1);
    const callArgs = mockedSendMail.mock.calls[0][0];

    expect(callArgs.to).toBe(params.to);
    expect(callArgs.subject).toBe(params.subject);
    expect(callArgs.html).toContain(params.title);
    expect(callArgs.html).toContain(params.content);
    expect(callArgs.html).toContain("ClipSphere");
  });

  it("should throw an error if sendMail fails", async () => {
    mockedSendMail.mockRejectedValueOnce(new Error("SMTP Failure"));

    const params = {
      to: "test@example.com",
      subject: "Test",
      title: "Test",
      content: "Test",
    };

    await expect(sendMail(params)).rejects.toThrow("SMTP Failure");
  });
});
