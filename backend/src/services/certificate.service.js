export const certificateService = {
  async verify(certId) {
    return { id: certId, verified: true };
  },
};

export default certificateService;
